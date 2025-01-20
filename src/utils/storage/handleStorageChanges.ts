import { getBaseUrl, displaySavedResults } from '@utils/results';

interface StorageChange<T = any> {
  oldValue?: T;
  newValue?: T;
}

interface PrData {
  results?: any[];
  detailedFeedback?: any;
}

interface ExtractedDataByPr {
  [key: string]: PrData;
}

interface ProcessingStorageChanges {
  processingComplete?: StorageChange<boolean>;
  extractedDataByPr?: StorageChange<ExtractedDataByPr>;
  error?: StorageChange<string>;
  [key: string]: StorageChange<any> | undefined;
}

export function handleStorageChanges(changes: ProcessingStorageChanges, area: string): void {
  const loadingDiv = document.getElementById('loading') as HTMLDivElement;
  const analyzeButton = document.getElementById('analyze') as HTMLButtonElement;
  const reanalyzeButton = document.getElementById('reanalyze') as HTMLButtonElement;
  const filePicker = document.getElementById('file-picker') as HTMLInputElement;
  const resultDiv = document.getElementById('result') as HTMLDivElement;

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
          const currentUrl = tabs[0]?.url;
          if (!currentUrl) return;
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
      // Get the previous and new values of extractedDataByPr
      const oldValue = changes.extractedDataByPr.oldValue || {};
      const newValue = changes.extractedDataByPr.newValue || {};

      // Get the current PR URL
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const currentUrl = tabs[0]?.url;
          if (!currentUrl) return;
          const basePrUrl = getBaseUrl(currentUrl);

          const oldPrData = oldValue[basePrUrl] || {};
          const newPrData = newValue[basePrUrl] || {};

          // Compare the old and new prData without the detailedFeedback property
          const oldPrDataWithoutFeedback = { ...oldPrData };
          const newPrDataWithoutFeedback = { ...newPrData };
          delete oldPrDataWithoutFeedback.detailedFeedback;
          delete newPrDataWithoutFeedback.detailedFeedback;

          const prDataChanged = JSON.stringify(oldPrDataWithoutFeedback) !== JSON.stringify(newPrDataWithoutFeedback);

          if (prDataChanged) {
            // Proceed to update the UI only if prData (excluding detailedFeedback) has changed
            if (newPrData && newPrData.results && newPrData.results.length > 0) {
              // Display saved results if available
              displaySavedResults(newPrData.results, resultDiv);
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
            // The change is only in detailedFeedback; skip UI update
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
