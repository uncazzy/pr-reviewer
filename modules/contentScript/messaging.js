import { getBaseUrl } from "../result/index.js";
import { setInStorage } from "../storage/index.js";

export function sendExtractedData(extractedData) {
  const currentPrUrl = window.location.href;
  const baseUrl = getBaseUrl(currentPrUrl);

  chrome.storage.local.get('extractedDataByPr', (data) => {
    console.log('Data retrieved from storage:', data);

    const extractedDataByPr = data.extractedDataByPr || {};

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
