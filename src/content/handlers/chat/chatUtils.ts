// Define the interface for chat messages
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Initialize chatMessages as an empty array to keep track of the conversation
export let chatMessages: ChatMessage[] = [];

// Function to clear chat messages
export function clearChatMessages(): void {
  chatMessages.length = 0; // Clear the array in place
}
