import { getDetailedFeedback } from '@utils/feedback/';

export function handleMessages() {
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
      return true;
    }
  });
}