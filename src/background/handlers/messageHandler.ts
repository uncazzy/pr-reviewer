import { getCurrentTabPrUrl } from '@/utils/tabs';
import { getDetailedFeedback } from '@utils/feedback/';

interface Message {
  action: 'getDetailedFeedback';
  fileName: string;
}

interface Response {
  detailedFeedback?: string | undefined;
}

export function handleMessages(): void {
  chrome.runtime.onMessage.addListener(async (
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: Response) => void
  ) => {
    if (message.action === 'getDetailedFeedback') {
      const baseUrl = await getCurrentTabPrUrl();
      if (!baseUrl) {
        // Handle the error case
        throw new Error('PR URL not found');
      }

      // Then call getDetailedFeedback with both parameters
      getDetailedFeedback(message.fileName, baseUrl)
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