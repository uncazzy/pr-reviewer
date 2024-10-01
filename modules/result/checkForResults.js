import { displaySavedResults } from './displaySavedResults.js';

export function checkForResults(currentUrl, resultDiv) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['allPrResults'], (data) => {
            const allPrResults = data.allPrResults || {};
            const prResults = allPrResults[currentUrl];

            if (prResults) {
                // Display stored results if they exist for the current PR
                displaySavedResults(prResults, resultDiv);
                resolve(true);
            } else {
                console.log('No saved results for this PR.');
                resultDiv.style.display = 'none';
                resolve(false);
            }
        });
    });
}