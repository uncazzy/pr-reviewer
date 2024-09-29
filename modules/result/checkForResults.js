import { displaySavedResults } from './displaySavedResults.js';
import { compareBaseUrls } from './compareBaseUrls.js';

export function checkForResults(currentUrl, resultDiv) {
  chrome.storage.local.get(['prResults', 'prUrl'], (data) => {
    if (data.prUrl && data.prResults) {
      const isSamePR = compareBaseUrls(currentUrl, data.prUrl);
      if (isSamePR) {
        // Display stored results if they match the current PR
        displaySavedResults(data.prResults, resultDiv);
      } else {
        console.log('No saved results for this PR.');
        resultDiv.style.display = 'none';
      }
    } else {
      console.log('No saved prUrl or prResults found.');
      resultDiv.style.display = 'none';
    }
  });
}