import { displaySavedResults } from '../result/index.js';

export function handleStorageChanges(changes, area) {
  const loadingDiv = document.getElementById('loading');
  const analyzeButton = document.getElementById('analyze');
  const reanalyzeButton = document.getElementById('reanalyze');
  const filePicker = document.getElementById('file-picker');
  const resultDiv = document.getElementById('result');

  if (area === 'local') {
    if (changes.processingComplete && changes.processingComplete.newValue) {
      // Hide the analyze button and show the reanalyze button
      analyzeButton.style.display = 'none';
      reanalyzeButton.style.display = 'inline-block';

      // Hide the file picker
      filePicker.style.display = 'none';
    }

    if (!loadingDiv || !analyzeButton || !resultDiv) {
      console.error('One or more elements are not defined in the DOM.');
      return;
    }

    if (changes.allPrResults) {
      // Get the current PR URL
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        const allPrResults = changes.allPrResults.newValue || {};
        const prResults = allPrResults[currentUrl];

        if (prResults) {
          displaySavedResults(prResults, resultDiv);
          analyzeButton.style.display = 'none';
          reanalyzeButton.style.display = 'inline-block';
          filePicker.style.display = 'none';
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