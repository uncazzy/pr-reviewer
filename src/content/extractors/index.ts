import { FileInfo } from './contentScript/dataExtractor';

interface ExtractedData {
    extractedData: FileInfo[];
}

interface ExtractedDataByPr {
    [key: string]: ExtractedData;
}

import {
    expandAllFiles,
    extractAllFilesData,
    sendExtractedData,
    waitForFilesToBePresent,
    extractFileInfo
} from './contentScript/index.js';
import { getFromStorage, setInStorage } from '@utils/storage';

// Generate a unique key for the current page
const getScriptKey = () => {
    try {
        const url = new URL(window.location.href);
        // Make sure we capture the PR number in the key
        const prMatch = url.pathname.match(/\/pull\/\d+/);
        return prMatch ? `scriptRun_${prMatch[0]}` : null;
    } catch (error) {
        console.error('Error generating script key:', error);
        return null;
    }
};

// Initialize the content script with proper locking
async function initializeContentScript() {
    const scriptKey = getScriptKey();
    if (!scriptKey) {
        console.log('Not a valid PR page, skipping initialization');
        return;
    }

    try {
        // Try to acquire the lock
        const storage = await chrome.storage.local.get(scriptKey);
        if (storage[scriptKey]) {
            const lastRunTime = storage[scriptKey];
            const timeSinceLastRun = Date.now() - lastRunTime;

            // If last run was less than 5 seconds ago, skip
            if (timeSinceLastRun < 5000) {
                console.log('Content script recently ran, skipping');
                return;
            }
        }

        // Set the lock with current timestamp
        await chrome.storage.local.set({ [scriptKey]: Date.now() });

        console.log('Content script loaded for:', scriptKey);

        // Ensure we're on a PR page before proceeding
        if (!document.querySelector('.pull-request-tab-content')) {
            console.log('Not on PR page content yet, waiting...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Rest of your initialization code remains the same...
        // [previous initialization code]
    } catch (error) {
        console.error('Error during content script initialization:', error);
        if (scriptKey) {
            await chrome.storage.local.remove(scriptKey);
        }
    }
}

// Clean up old script locks periodically
async function cleanupOldScriptLocks() {
    const LOCK_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    try {
        const storage = await chrome.storage.local.get(null);
        const now = Date.now();

        const keysToRemove = Object.entries(storage)
            .filter(([key, timestamp]) =>
                key.startsWith('scriptRun_') &&
                (now - (timestamp as number)) > LOCK_TIMEOUT
            )
            .map(([key]) => key);

        if (keysToRemove.length > 0) {
            await chrome.storage.local.remove(keysToRemove);
        }
    } catch (error) {
        console.error('Error cleaning up script locks:', error);
    }
}

// Initialize the content script and handle navigation
(async () => {
    await cleanupOldScriptLocks();
    await initializeContentScript();

    // Handle GitHub's SPA navigation
    const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' &&
                document.location.href.includes('/pull/') &&
                document.location.href.includes('/files')) {
                await initializeContentScript();
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {

    console.log("Request:", request);

    if (request.action === 'scrapeFiles') {
        console.log('Scraping files...');

        (async function () {
            try {
                await waitForFilesToBePresent();
                await expandAllFiles();
                const extractedData = extractAllFilesData();

                if (extractedData.length > 0) {
                    console.log('Extracted data:', extractedData);
                    sendExtractedData(extractedData);
                    sendResponse({ success: true });
                } else {
                    console.warn('No extracted data to send.');
                    sendResponse({ success: false, error: 'No data found' });
                }
            } catch (error) {
                console.error('Error in scrapeFiles:', error);
                sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
        })();
    } else if (request.action === 'expandAndScrapeLargeFile') {
        const { fileName, index, basePrUrl } = request;

        expandAndScrapeLargeFile(fileName, index, basePrUrl)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error in expandAndScrapeLargeFile:', error);
                sendResponse({ success: false, error: error.message });
            });
    }

    return true; // Keep the message channel open for sendResponse
});

async function expandAndScrapeLargeFile(
    fileName: string,
    index: number,
    basePrUrl: string
): Promise<void> {
    // Fetch `extractedDataByPr` from storage
    let extractedDataByPr: ExtractedDataByPr = await getFromStorage('extractedDataByPr') || {};

    // Ensure `extractedData` exists for this base PR URL
    if (!extractedDataByPr[basePrUrl]) {
        extractedDataByPr[basePrUrl] = { extractedData: [] };
    }

    // Find the file element in the page that matches fileName
    const fileElements = document.querySelectorAll('.file');
    let fileFound = false;

    for (const fileElement of fileElements) {
        const fileNameElement = fileElement.querySelector('.file-info .Truncate a');
        if (fileNameElement && fileNameElement.textContent?.trim() === fileName) {
            fileFound = true;
            // Check if it has a "Load diff" button
            const loadDiffButton = fileElement.querySelector('button.load-diff-button');
            if (loadDiffButton instanceof HTMLButtonElement) {

                if (loadDiffButton) {
                    // Click the button to load the diff
                    loadDiffButton.click();

                    // Wait for the diff to load
                    await waitForDiffToLoad(fileElement);
                }
            }

            // Now, extract the file data
            const fileInfo = extractFileInfo(fileElement, index, true);
            if (fileInfo) {
                // Find the specific file data in extractedData where fileName matches
                let existingFileIndex = extractedDataByPr[basePrUrl].extractedData.findIndex(item => item.fileName === fileName);

                if (existingFileIndex !== -1) {
                    // Update the existing file info
                    extractedDataByPr[basePrUrl].extractedData[existingFileIndex] = fileInfo;
                } else {
                    // If the file doesn’t exist, add it to the array
                    extractedDataByPr[basePrUrl].extractedData.push(fileInfo);
                }

                // Save back to storage
                await setInStorage({ extractedDataByPr })
            }

            break;
        }
    }

    if (!fileFound) {
        throw new Error(`File ${fileName} not found on the page.`);
    }
}

// Helper function to wait for the diff to load
async function waitForDiffToLoad(fileElement: Element): Promise<void> {
    return new Promise((resolve, _reject) => {
        const observer = new MutationObserver(() => {
            const isLoading = fileElement.querySelector('.js-diff-progressive-loader');
            if (!isLoading) {
                observer.disconnect();
                resolve();
            }
        });
        observer.observe(fileElement, { childList: true, subtree: true });
    });
}