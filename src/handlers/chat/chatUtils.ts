/**
 * Represents a message in the chat conversation.
 */
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Initialize chatMessages as an empty array to keep track of the conversation
export let chatMessages: ChatMessage[] = [];

/**
 * Clears all messages from the chat history.
 */
export function clearChatMessages(): void {
    chatMessages.length = 0; // Clear the array in place
}