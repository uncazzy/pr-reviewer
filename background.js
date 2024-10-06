import { initializeFeedbackListener } from "./modules/feedback/messageListener.js";
import { getDetailedFeedback } from "./modules/feedback/getDetailedFeedback.js";

// Initialize the listener for feedback-related messages
initializeFeedbackListener();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDetailedFeedback') {
    getDetailedFeedback(message.fileName)
      .then((feedback) => {
        sendResponse({ detailedFeedback: feedback });
      })
      .catch((error) => {
        console.error('Error in getDetailedFeedback:', error);
        sendResponse({ error: 'Failed to get detailed feedback' });
      });
    return true; // Indicates that the response is sent asynchronously
  }
});