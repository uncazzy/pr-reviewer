import { displaySavedResults } from './displaySavedResults';
import { getBaseUrl } from './getBaseUrl';
import { FeedbackMessage } from '@components/feedback/FileFeedback';

interface CheckResultsResponse {
    hasResults: boolean;
    hasExtractedData: boolean;
}

interface PrData {
    results?: FeedbackMessage[];
    extractedData?: any[];
}

interface StorageData {
    extractedDataByPr?: {
        [key: string]: PrData;
    };
}

/**
 * Checks for existing results in storage and displays them if found
 * @param currentUrl - The current PR URL to check results for
 * @param resultDiv - The div element to display results in
 * @param filePickerDiv - Optional div element for file picker UI
 * @returns Promise resolving to an object indicating if results and extracted data exist
 */
export function checkForResults(
    currentUrl: string,
    resultDiv: HTMLElement,
    filePickerDiv?: HTMLElement
): Promise<CheckResultsResponse> {
    const baseUrl = getBaseUrl(currentUrl);

    return new Promise((resolve) => {
        chrome.storage.local.get(['extractedDataByPr'], (data: StorageData) => {
            const extractedDataByPr = data.extractedDataByPr || {};
            const prData = extractedDataByPr[baseUrl];

            const hasResults = Boolean(prData?.results && prData.results.length > 0);
            const hasExtractedData = Boolean(prData?.extractedData && prData.extractedData.length > 0);

            if (hasResults && prData?.results) {
                // Display saved results
                displaySavedResults(prData.results, resultDiv);
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
