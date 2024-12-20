import { getApiKey, getModel } from '@utils/storage';
import { chatMessages, ChatMessage } from '@content/handlers/chat/chatUtils';
import { createChatPrompt, createSystemPrompt } from '@utils/api/openai/prompts/chatPrompt';
import { getBaseUrl } from '@utils/results';
import { marked } from 'marked';
import hljs from 'highlight.js';

interface FileData {
    fileName: string;
    status?: string;
    issue?: string;
    fileHref?: string;
    fullContent?: string;
    index?: number;
}

interface ExtractedData {
    extractedData: FileData[];
}

interface ExtractedDataByPr {
    [baseUrl: string]: ExtractedData;
}

export async function sendMessageToLLM(
    fileName: string,
    detailedFeedback: string,
    fullContent: string,
    userQuestion: string,
    messagesContainer: HTMLElement
): Promise<void> {
    let fileData: FileData | null = null;

    try {
        // Retrieve the `extractedDataByPr` and find the relevant file data using the base URL
        const baseUrl = await new Promise<string>((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!tabs[0]?.url) {
                    reject(new Error('No active tab URL found'));
                    return;
                }
                try {
                    resolve(getBaseUrl(tabs[0].url));
                } catch (error) {
                    reject(error);
                }
            });
        });

        const data = await new Promise<{ extractedDataByPr?: ExtractedDataByPr }>((resolve) =>
            chrome.storage.local.get('extractedDataByPr', resolve)
        );
        const extractedDataByPr = data.extractedDataByPr || {};

        // Get the specific PR data using the base URL
        const prData = extractedDataByPr[baseUrl];
        if (prData && prData.extractedData && prData.extractedData.length > 0) {
            // Find the specific file data based on fileName
            const foundFile = prData.extractedData.find(file => file.fileName === fileName);
            fileData = foundFile || null;

            if (!fileData) {
                console.warn(`No extracted data found for file: ${fileName}. Proceeding without file context.`);
            }
        } else {
            console.warn(`No extractedData found for baseUrl: ${baseUrl}. Proceeding without file context.`);
        }
    } catch (error) {
        console.error('Error retrieving extracted data from storage:', error);
    }

    // Prepare the system and initial prompts using the new prompt functions
    const systemPrompt: ChatMessage = createSystemPrompt(fileName, fullContent);
    const initialPrompt: ChatMessage = createChatPrompt(
        fileName,
        fullContent,
        fileData ? {
            status: fileData.status || 'Unknown',
            issue: fileData.issue || 'No issues found'
        } : {
            status: 'No File Data Available',
            issue: 'Unable to retrieve file information'
        }
    );

    // Prepare the messages to send to OpenAI API
    let apiMessages: ChatMessage[] = []; // Messages sent to the LLM, including system and initial prompts

    // Retrieve apiMessages from storage or initialize them
    let apiMessagesHistory: { [key: string]: ChatMessage[] } = {};
    let storedApiMessages: ChatMessage[] = [];

    await new Promise<void>((resolve) => {
        chrome.storage.local.get(['apiMessagesHistory'], (data) => {
            apiMessagesHistory = data.apiMessagesHistory || {};
            storedApiMessages = apiMessagesHistory[fileName] || [];
            resolve();
        });
    });

    if (storedApiMessages.length === 0) {
        // First time, initialize apiMessages
        apiMessages = [
            systemPrompt,
            initialPrompt,
            { role: 'assistant', content: detailedFeedback }
        ];
    } else {
        // Use stored apiMessages
        apiMessages = storedApiMessages;
    }

    // Add the user's latest question
    apiMessages.push({ role: 'user', content: userQuestion });

    // Log the messages sent to LLM
    console.log("Sending to LLM: ", apiMessages);

    try {
        // Retrieve API key & model from storage
        const apiKey = await getApiKey();
        const model = await getModel();
        if (!apiKey) {
            throw new Error('OpenAI API key not found.');
        }

        // Stream the response from the LLM
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: apiMessages,
                stream: true,
                max_tokens: 1000,
                temperature: 0.2
            })
        });

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantMessage = '';
        let partialData = ''; // Buffer to hold incomplete JSON chunks

        // Create a new message element to show the streaming response
        const assistantMessageDiv = document.createElement('div');
        assistantMessageDiv.className = 'chat-message assistant-message';

        // Create avatar and message content
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = '<i class="fas fa-code-branch"></i>';

        const messageContentDiv = document.createElement('div');
        messageContentDiv.className = 'message-content';

        assistantMessageDiv.appendChild(avatar);
        assistantMessageDiv.appendChild(messageContentDiv);

        messagesContainer.appendChild(assistantMessageDiv);

        // Scroll to the bottom initially
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                // Decode the incoming chunk
                const chunk = decoder.decode(value, { stream: true });

                // Process each line of the stream, which starts with "data: "
                const lines = chunk.split("\n");
                for (let line of lines) {
                    line = line.trim();
                    if (line.startsWith("data:")) {
                        const jsonData = line.substring(5).trim();  // Remove "data: "

                        if (jsonData === "[DONE]") {
                            done = true;
                            break;
                        }

                        try {
                            // Buffer incomplete chunks and combine them into a complete JSON object
                            partialData += jsonData;

                            // Try parsing the buffered data
                            const parsedData = JSON.parse(partialData);
                            const delta = parsedData.choices[0].delta;

                            if (delta && delta.content) {
                                assistantMessage += delta.content;
                                const parsedContent = await Promise.resolve(marked.parse(assistantMessage));
                                messageContentDiv.innerHTML = parsedContent;

                                // Apply syntax highlighting
                                messageContentDiv.querySelectorAll('pre code').forEach((block) => {
                                    if (block instanceof HTMLElement) {
                                        hljs.highlightElement(block);
                                    }
                                });
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            }

                            // Clear partial data once successfully parsed
                            partialData = '';

                        } catch (err) {
                            // If there's a parsing error, it's likely due to incomplete JSON
                            console.warn('Incomplete or malformed JSON, awaiting more chunks...', err);
                        }
                    }
                }
            }
        }

        // Scroll to the bottom after updating the assistant's message
        assistantMessageDiv.scrollIntoView({ behavior: 'smooth' });

        // Add the assistant's response to the chat history
        chatMessages.push({ role: 'assistant', content: assistantMessage });
        apiMessages.push({ role: 'assistant', content: assistantMessage });

        // Save messages and apiMessages to storage
        chrome.storage.local.get(['chatHistory', 'apiMessagesHistory'], (data) => {
            let chatHistory: { [key: string]: ChatMessage[] } = data.chatHistory || {};
            let apiMessagesHistory: { [key: string]: ChatMessage[] } = data.apiMessagesHistory || {};

            chatHistory[fileName] = chatMessages;
            apiMessagesHistory[fileName] = apiMessages;

            chrome.storage.local.set({ chatHistory, apiMessagesHistory });
        });

    } catch (error) {
        console.error('Error sending message to LLM:', error instanceof Error ? error.message : error);
    }
}
