
import { displaySavedResults } from '../result/index.js'

export function handleStorageChanges(changes, area) {
    if (area === 'local') {
      const loadingDiv = document.getElementById('loading');
      const analyzeButton = document.getElementById('analyze');
      const resultDiv = document.getElementById('result');
  
      if (!loadingDiv || !analyzeButton || !resultDiv) {
        console.error('One or more elements are not defined in the DOM.');
        return;
      }
  
      if (changes.prResults) {
        const results = changes.prResults.newValue;
        displaySavedResults(results, resultDiv); // Display the stored results when they change
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