import { getBaseUrl } from "../result";

export function sendExtractedData(extractedData) {
  const currentPrUrl = window.location.href;
  const baseUrl = getBaseUrl(currentPrUrl);

  chrome.storage.local.get('extractedDataByPr', (data) => {
    const extractedDataByPr = data.extractedDataByPr || {};

    // Ensure the baseUrl key exists and is an object
    if (!extractedDataByPr[baseUrl]) {
      extractedDataByPr[baseUrl] = {};
    }

    // Assign the extractedData array to the extractedData property
    extractedDataByPr[baseUrl].extractedData = extractedData;

    chrome.storage.local.set({ extractedDataByPr }, () => {
      console.log('Extracted data saved to local storage for PR:', baseUrl);

      // Send a message indicating that extraction is complete
      chrome.runtime.sendMessage({ type: 'extractionComplete', prUrl: baseUrl });
    });
  });
}