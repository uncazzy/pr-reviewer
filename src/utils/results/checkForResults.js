import { displaySavedResults } from './displaySavedResults.js';
import { getBaseUrl } from './getBaseUrl.js';

export function checkForResults(currentUrl, resultDiv, filePickerDiv) {
    const baseUrl = getBaseUrl(currentUrl);

    return new Promise((resolve) => {
        chrome.storage.local.get(['extractedDataByPr'], (data) => {
            const extractedDataByPr = data.extractedDataByPr || {};
            const prData = extractedDataByPr[baseUrl];

            const hasResults = prData && prData.results && prData.results.length > 0;
            const hasExtractedData = prData && prData.extractedData && prData.extractedData.length > 0;

            if (hasResults) {
                // Display saved results
                const results = prData.results;
                displaySavedResults(results, resultDiv);
                resultDiv.style.display = 'block';
                if (filePickerDiv) filePickerDiv.style.display = 'none';
            } else {
                // No results yet
                resultDiv.style.display = 'none';
                if (filePickerDiv) filePickerDiv.style.display = 'none';
            }

            // Resolve both hasResults and hasExtractedData
            resolve({ hasResults, hasExtractedData });
        });
    });
}
