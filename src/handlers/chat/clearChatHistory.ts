import { renderMessage } from './renderMessage.ts';
import { chatMessages, clearChatMessages, ChatMessage } from './chatUtils.ts';

interface ChatHistory {
    [fileName: string]: ChatMessage[];
}

interface ApiMessagesHistory {
    [fileName: string]: ChatMessage[];
}

interface StorageData {
    chatHistory?: ChatHistory;
    apiMessagesHistory?: ApiMessagesHistory;
}

/**
 * Renders the welcome message for a given file.
 * 
 * @param fileName - The name of the file being reviewed
 * @param messagesContainer - The container element for chat messages
 * @returns The created welcome message
 */
async function renderWelcomeMessage(
    fileName: string,
    messagesContainer: HTMLDivElement
): Promise<ChatMessage> {
    const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `<p><strong>Hello!</strong> I'm here to help you with the code changes in <strong>${fileName}</strong>. Feel free to ask any questions or request further explanations about the code review.</p>`,
    };
    chatMessages.push(welcomeMessage); // Push to the in-memory chatMessages array

    // Render the welcome message and scroll to the bottom
    await renderMessage(welcomeMessage, messagesContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return welcomeMessage;
}

/**
 * Clears the chat history for a specific file and reinitializes with a welcome message.
 * 
 * @param fileName - The name of the file whose chat history should be cleared
 * @param messagesContainer - The container element for chat messages
 */
export async function clearChatHistory(
    fileName: string,
    messagesContainer: HTMLDivElement
): Promise<void> {
    if (confirm('Are you sure you want to clear the chat history?')) {
        // Clear the in-memory chat messages array
        clearChatMessages();

        // Clear chat history and apiMessages from storage
        chrome.storage.local.get(['chatHistory', 'apiMessagesHistory'], async (data: StorageData) => {
            let chatHistory = data.chatHistory || {};
            let apiMessagesHistory = data.apiMessagesHistory || {};

            // Remove specific file's chat history and messages from storage
            delete chatHistory[fileName];
            delete apiMessagesHistory[fileName];

            // Set the new storage values after deletion
            chrome.storage.local.set({ chatHistory, apiMessagesHistory }, async () => {
                // Clear the messages displayed in the UI
                messagesContainer.innerHTML = '';

                // Initialize and render a new welcome message for the cleared chat
                const welcomeMessage = await renderWelcomeMessage(fileName, messagesContainer);

                // Save the welcome message to chat history in storage
                chatHistory[fileName] = [welcomeMessage];
                chrome.storage.local.set({ chatHistory });
            });
        });
    }
}
