// import { getDetailedFeedback } from './getDetailedFeedback.js';

// Function to initialize feedback-related message listeners
export function initializeFeedbackListener() {
    // Listener for getDetailedFeedback messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'getDetailedFeedback') {
            getDetailedFeedback(message.fileName)
                .then((feedback) => sendResponse({ detailedFeedback: feedback }))
                .catch((error) => {
                    console.error('Error in getDetailedFeedback:', error);
                    sendResponse({ error: 'Failed to get detailed feedback' });
                });
            return true; // Indicates that the response is sent asynchronously
        }
    });
}
