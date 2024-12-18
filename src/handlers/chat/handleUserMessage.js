import { renderMessage } from "./renderMessage.js";
import { sendMessageToLLM } from './sendMessageToLLM.js';
import { chatMessages } from './chatUtils.js';

export function handleUserMessage(messageContent, fileName, feedback, fullContent, messagesContainer) {
    // Create a new user message object and push it to chatMessages array
    const userMessage = { role: 'user', content: messageContent };
    chatMessages.push(userMessage);

    // Save the updated chat history to local storage
    chrome.storage.local.get(['chatHistory'], (data) => {
        let chatHistory = data.chatHistory || {};
        chatHistory[fileName] = chatMessages;
        chrome.storage.local.set({ chatHistory });
    });

    // Render the user message in the UI
    renderMessage(userMessage, messagesContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Send the user's message to LLM for further processing
    sendMessageToLLM(fileName, feedback, fullContent, messageContent, messagesContainer);
}