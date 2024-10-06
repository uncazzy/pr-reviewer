import { displaySavedResults } from './displaySavedResults.js';
import { createFilePicker } from '../components/createFilePicker.js';
import { getBaseUrl } from './getBaseUrl.js';

export function checkForResults(currentUrl, resultDiv, filePickerDiv) {
    const baseUrl = getBaseUrl(currentUrl);

    return new Promise((resolve) => {
        chrome.storage.local.get(['extractedDataByPr'], (data) => {
            const extractedDataByPr = data.extractedDataByPr || {};
            const prData = extractedDataByPr[baseUrl];

            if (prData && prData.results && prData.results.length > 0) {
                // Display saved results
                const results = prData.results;
                displaySavedResults(results, resultDiv);
                resultDiv.style.display = 'block';
                if (filePickerDiv) filePickerDiv.style.display = 'none';
                resolve(true); // Indicate that results exist
            } else {
                // No results yet
                resultDiv.style.display = 'none';
                if (filePickerDiv) filePickerDiv.style.display = 'none';
                resolve(false); // Indicate that results do not exist
            }
        });
    });
}