import OpenAI from 'openai';
import { getApiKey, getModel, getProvider } from '../../utils/storage/index.ts';
import { chatMessages, ChatMessage } from './chatUtils.ts';
import { createChatPrompt, createSystemPrompt } from '../../utils/api/openai/prompts/chatPrompt.ts';
import { getBaseUrl } from '../../utils/results/index.ts';
import { renderMessage } from './renderMessage.ts';

interface ExtractedData {
    fileName: string;
    fullContent: string;
    status?: string;
    issue?: string;
    [key: string]: any;
}

interface PrResult {
    status?: string | undefined;
    issue?: string | undefined;
}

interface ExtractedDataByPr {
    [baseUrl: string]: {
        extractedData: ExtractedData[];
    };
}

interface StorageData {
    extractedDataByPr?: ExtractedDataByPr;
    apiMessagesHistory?: {
        [fileName: string]: ChatMessage[];
    };
    chatHistory?: {
        [fileName: string]: ChatMessage[];
    };
}

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * Sends a user message to the LLM for processing and handles the response.
 * 
 * @param fileName - The name of the file being discussed
 * @param detailedFeedback - The detailed feedback context
 * @param fullContent - The full content of the file
 * @param userQuestion - The user's question or message
 * @param messagesContainer - The container element for chat messages
 */
export async function sendMessageToLLM(
    fileName: string,
    detailedFeedback: string,
    fullContent: string,
    userQuestion: string,
    messagesContainer: HTMLDivElement
): Promise<void> {
    let fileData: ExtractedData | undefined = undefined;

    try {
        // Retrieve the `extractedDataByPr` and find the relevant file data using the base URL
        const baseUrl = await new Promise<string>((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(getBaseUrl(tabs[0]?.url || ''));
            });
        });

        const data = await new Promise<StorageData>((resolve) =>
            chrome.storage.local.get('extractedDataByPr', resolve)
        );
        const extractedDataByPr = data.extractedDataByPr || {};

        // Get the specific PR data using the base URL
        const prData = extractedDataByPr[baseUrl];
        if (prData && prData.extractedData && prData.extractedData.length > 0) {
            // Find the specific file data based on fileName
            fileData = prData.extractedData.find(file => file.fileName === fileName);

            if (!fileData) {
                // No extracted data found for file. Proceeding without file context.
            }
        } else {
            // No extractedData found for baseUrl. Proceeding without file context.
        }
    } catch (error) {
        console.error('Error retrieving extracted data from storage:', error);
    }

    // Create a PrResult from the feedback string
    const feedbackParts = detailedFeedback.split('\n');
    const prResult: PrResult = {
        status: feedbackParts.find(line => line.startsWith('Status:'))?.split('Status:')[1]?.trim() || 'N/A',
        issue: feedbackParts.find(line => line.startsWith('Issue:'))?.split('Issue:')[1]?.trim() || 'N/A'
    };

    // Prepare the system and initial prompts using the new prompt functions
    const systemPrompt = createSystemPrompt(fileName, fullContent);
    const initialPrompt = createChatPrompt(fileName, fullContent, prResult);

    // Prepare the messages to send to OpenAI API
    let apiMessages: OpenAIMessage[] = []; // Messages sent to the LLM, including system and initial prompts

    // Retrieve apiMessages from storage or initialize them
    let apiMessagesHistory: { [fileName: string]: OpenAIMessage[] } = {};
    let storedApiMessages: OpenAIMessage[] = [];

    await new Promise<void>((resolve) => {
        chrome.storage.local.get(['apiMessagesHistory'], (data: StorageData) => {
            apiMessagesHistory = data.apiMessagesHistory || {};
            storedApiMessages = apiMessagesHistory[fileName] || [];
            resolve();
        });
    });

    // If we have stored messages, use them; otherwise, initialize with system and initial prompts
    if (storedApiMessages.length > 0) {
        apiMessages = storedApiMessages;
    } else {
        apiMessages = [
            { role: 'system', content: systemPrompt.content },
            { role: 'assistant', content: initialPrompt.content }
        ];
    }

    // Add the user's new message
    apiMessages.push({ role: 'user', content: userQuestion });

    try {
        const apiKey = await getApiKey();
        const model = await getModel();
        const provider = await getProvider();

        // Create the loading message
        const loadingMessage: ChatMessage = {
            role: 'assistant',
            content: '<p><em>Thinking...</em></p>'
        };
        chatMessages.push(loadingMessage);
        await renderMessage(loadingMessage, messagesContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey,
            baseURL: provider === 'deepseek' ? 'https://api.deepseek.com' : undefined,
            dangerouslyAllowBrowser: true
        });

        // Make the API call
        const response = await openai.chat.completions.create({
            model,
            messages: apiMessages,
            temperature: 0.2
        });

        if (!response.choices?.[0]?.message?.content) {
            throw new Error('No response content received from the API');
        }

        const assistantResponse = response.choices[0].message.content;

        // Remove the loading message from both UI and chatMessages array
        const loadingMessageIndex = chatMessages.indexOf(loadingMessage);
        if (loadingMessageIndex !== -1) {
            chatMessages.splice(loadingMessageIndex, 1);
            messagesContainer.removeChild(messagesContainer.lastChild!);
        }

        // Create and display the actual response message
        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: assistantResponse
        };
        chatMessages.push(assistantMessage);
        await renderMessage(assistantMessage, messagesContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add the assistant's response to apiMessages and save to storage
        apiMessages.push({ 
            role: 'assistant', 
            content: assistantResponse
        });
        apiMessagesHistory[fileName] = apiMessages;
        chrome.storage.local.set({ apiMessagesHistory });

        // Save the updated chat history to storage
        chrome.storage.local.get(['chatHistory'], (data: StorageData) => {
            let chatHistory = data.chatHistory || {};
            chatHistory[fileName] = chatMessages;
            chrome.storage.local.set({ chatHistory });
        });

    } catch (error) {
        console.error('Error in API call:', error);
        const errorMessage: ChatMessage = {
            role: 'assistant',
            content: `<p class="error">Error: ${error instanceof Error ? error.message : 'An error occurred while processing your request.'}</p>`
        };
        chatMessages.push(errorMessage);
        await renderMessage(errorMessage, messagesContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
