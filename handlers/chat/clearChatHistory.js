import { renderMessage } from '../../helpers/renderMessage.js';
import { chatMessages, clearChatMessages } from './chatUtils.js';

// Utility function to render the welcome message
function renderWelcomeMessage(fileName, messagesContainer) {
  const welcomeMessage = {
    role: 'assistant',
    content: `<p><strong>Hello!</strong> I'm here to help you with the code changes in <strong>${fileName}</strong>. Feel free to ask any questions or request further explanations about the code review.</p>`,
  };
  chatMessages.push(welcomeMessage); // Push to the in-memory chatMessages array

  // Render the welcome message and scroll to the bottom
  renderMessage(welcomeMessage, messagesContainer);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return welcomeMessage; // Return for further usage if needed
}

// Function to clear chat history and reinitialize the welcome message
export function clearChatHistory(fileName, messagesContainer) {
  if (confirm('Are you sure you want to clear the chat history?')) {
    // Clear the in-memory chat messages array
    clearChatMessages(); // This function resets `chatMessages` to an empty array

    // Clear chat history and apiMessages from storage
    chrome.storage.local.get(['chatHistory', 'apiMessagesHistory'], (data) => {
      let chatHistory = data.chatHistory || {};
      let apiMessagesHistory = data.apiMessagesHistory || {};

      // Remove specific file's chat history and messages from storage
      delete chatHistory[fileName];
      delete apiMessagesHistory[fileName];

      // Set the new storage values after deletion
      chrome.storage.local.set({ chatHistory, apiMessagesHistory }, () => {
        // Clear the messages displayed in the UI
        messagesContainer.innerHTML = '';

        // Initialize and render a new welcome message for the cleared chat
        const welcomeMessage = renderWelcomeMessage(fileName, messagesContainer);

        // Save the welcome message to chat history in storage
        chatHistory[fileName] = [welcomeMessage];
        chrome.storage.local.set({ chatHistory });
      });
    });
  }
}
