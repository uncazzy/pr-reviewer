import { renderMessage } from './renderMessage.ts';
import { sendMessageToLLM } from './sendMessageToLLM.ts';
import { chatMessages, ChatMessage } from './chatUtils.ts';

interface ChatHistory {
    [fileName: string]: ChatMessage[];
}

interface StorageData {
    chatHistory?: ChatHistory;
}

/**
 * Handles a new message from the user by:
 * 1. Adding it to chat history
 * 2. Saving to local storage
 * 3. Rendering in UI
 * 4. Sending to LLM for processing
 * 
 * @param messageContent - The content of the user's message
 * @param fileName - The name of the file being discussed
 * @param feedback - The feedback context for the conversation
 * @param fullContent - The full content of the file being discussed
 * @param messagesContainer - The container element for chat messages
 */
export async function handleUserMessage(
    messageContent: string,
    fileName: string,
    feedback: string,
    fullContent: string,
    messagesContainer: HTMLDivElement
): Promise<void> {
    // Create a new user message object and push it to chatMessages array
    const userMessage: ChatMessage = {
        role: 'user',
        content: messageContent
    };
    chatMessages.push(userMessage);

    // Save the updated chat history to local storage
    chrome.storage.local.get(['chatHistory'], (data: StorageData) => {
        let chatHistory = data.chatHistory || {};
        chatHistory[fileName] = chatMessages;
        chrome.storage.local.set({ chatHistory });
    });

    // Render the user message in the UI
    await renderMessage(userMessage, messagesContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Send the user's message to LLM for further processing
    await sendMessageToLLM(fileName, feedback, fullContent, messageContent, messagesContainer);
}