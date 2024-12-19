import { getDetailedFeedback } from '@utils/feedback/';

interface Message {
  action: 'getDetailedFeedback';
  fileName: string;
}

interface Response {
  detailedFeedback?: string;
}

export function handleMessages(): void {
  chrome.runtime.onMessage.addListener((
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: Response) => void
  ) => {
    if (message.action === 'getDetailedFeedback') {
      getDetailedFeedback(message.fileName)
        .then((feedback) => {
          sendResponse({ detailedFeedback: feedback });
        })
        .catch((error) => {
          console.error('Error in getDetailedFeedback:', error);
          sendResponse({ detailedFeedback: undefined });
        });
    }
    return true; // Required to use sendResponse asynchronously
  });
}