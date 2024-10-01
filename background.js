import { initializeFeedbackListener } from "./modules/feedback/messageListener.js";
import { getDetailedFeedback } from "./modules/feedback/getDetailedFeedback.js";
import { setInStorage } from './modules/storage/index.js';

// Initialize the listener for feedback-related messages
initializeFeedbackListener();

// Store extractedData globally
let extractedData = [];

// Combined listener for messages from contentScript.js, detailedFeedback.js, or other sources
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.files) {
    // Handle the message containing files (contentScript.js)
    extractedData = message.files;

    // Save extractedData to local storage
    setInStorage('extractedData', extractedData)
      .then(() => console.log('Extracted data saved to local storage'))
      .catch(console.error);

  } else if (message.action === 'getDetailedFeedback') {
    // Handle the message for getting detailed feedback (detailedFeedback.js)
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