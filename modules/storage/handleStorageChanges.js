import { getBaseUrl, displaySavedResults } from '../result/index.js';

export function handleStorageChanges(changes, area) {
  const loadingDiv = document.getElementById('loading');
  const analyzeButton = document.getElementById('analyze');
  const reanalyzeButton = document.getElementById('reanalyze');
  const filePicker = document.getElementById('file-picker');
  const resultDiv = document.getElementById('result');

  // Check if all required DOM elements are present
  if (!loadingDiv || !analyzeButton || !reanalyzeButton || !filePicker || !resultDiv) {
    console.error('One or more elements are not defined in the DOM.');
    return;
  }

  if (area === 'local') {
    if (changes.processingComplete && changes.processingComplete.newValue) {
      // Get the current PR URL
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const currentUrl = tabs[0].url;
          const basePrUrl = getBaseUrl(currentUrl);

          chrome.storage.local.get('extractedDataByPr', (data) => {
            const extractedDataByPr = data.extractedDataByPr || {};
            const prData = extractedDataByPr[basePrUrl];

            if (prData && prData.results && prData.results.length > 0) {
              // Hide the analyze button and show the reanalyze button
              analyzeButton.style.display = 'none';
              reanalyzeButton.style.display = 'inline-block';

              // Hide the file picker
              filePicker.style.display = 'none';

              // Display the results
              displaySavedResults(prData.results, resultDiv);
            } else {
              // No results yet, keep the analyze button visible
              analyzeButton.style.display = 'inline-block';
              reanalyzeButton.style.display = 'none';
              filePicker.style.display = 'block';
            }
          });
        } else {
          console.error('No active tab found.');
        }
      });
    }

    if (changes.extractedDataByPr) {
      // Get the current PR URL
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const currentUrl = tabs[0].url;
          const basePrUrl = getBaseUrl(currentUrl);
          const extractedDataByPr = changes.extractedDataByPr.newValue || {};
          const prData = extractedDataByPr[basePrUrl];

          if (prData && prData.results && prData.results.length > 0) {
            // Display saved results if available
            displaySavedResults(prData.results, resultDiv);
            analyzeButton.style.display = 'none';
            reanalyzeButton.style.display = 'inline-block';
            filePicker.style.display = 'none';
          } else {
            // No results yet; ensure the analyze button is visible and reanalyze button is hidden
            analyzeButton.style.display = 'inline-block';
            reanalyzeButton.style.display = 'none';
            filePicker.style.display = 'block'; // Show file picker if appropriate
          }
        } else {
          console.error('No active tab found.');
        }
      });
    }

    if (changes.processingComplete) {
      loadingDiv.style.display = 'none';
      analyzeButton.disabled = false;
    }

    if (changes.error) {
      loadingDiv.style.display = 'none';
      analyzeButton.disabled = false;
      alert(changes.error.newValue);
      chrome.storage.local.remove('error'); // Clear the error to avoid repeated alerts
      resultDiv.style.display = 'none';
    }
  }
}
