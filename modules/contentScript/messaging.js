import { getBaseUrl } from "../result/index.js";
import { setInStorage } from "../storage/index.js";

const MAX_PR_LIMIT = 5;

export function sendExtractedData(extractedData) {
  const currentPrUrl = window.location.href;
  const baseUrl = getBaseUrl(currentPrUrl);

  chrome.storage.local.get('extractedDataByPr', (data) => {
    console.log('Data retrieved from storage:', data);

    const extractedDataByPr = data.extractedDataByPr || {};
    let prOrder = data.prOrder || [];

    // Add the new PR to prOrder
    prOrder.push(baseUrl);
    console.log(`Added PR to order: ${baseUrl}`);

    // Check if the number of PRs exceeds the limit
    if (prOrder.length > MAX_PR_LIMIT) {
      // Remove the oldest PR
      const oldestPr = prOrder.shift(); // Removes the first element
      delete extractedDataByPr[oldestPr];
      console.log(`Removed oldest PR: ${oldestPr}`);
    }

    // Update the extractedDataByPr object directly
    extractedDataByPr[baseUrl] = {
      extractedData: extractedData
    };

    // Save back to storage
    setInStorage({ extractedDataByPr }).then(() => {
      console.log('Extracted data saved to local storage for PR:', baseUrl);

      // Send a message indicating that extraction is complete
      chrome.runtime.sendMessage({ type: 'extractionComplete', prUrl: baseUrl });
    }).catch(error => {
      console.error('Error saving extracted data:', error);
    });
  });
}