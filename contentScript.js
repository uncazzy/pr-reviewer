import {
    expandAllFiles,
    extractAllFilesData,
    sendExtractedData,
    waitForFilesToBePresent,
    extractFileInfo
} from './modules/contentScript/index.js';
import { getFromStorage, setInStorage } from "./modules/storage/index.js";

if (!window.hasContentScriptRun) {
    window.hasContentScriptRun = true;

    (async function () {
        console.log('Content script loaded');

        // Wait for the DOM to be fully loaded
        if (document.readyState === 'loading' || document.readyState === 'interactive') {
            console.log('Waiting for DOM to fully load...');
            await new Promise((resolve) => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        console.log('DOM fully loaded, waiting for files to be present...');
        await waitForFilesToBePresent();

        console.log('Files are present, expanding files...');

        // Expand all files before extracting
        await expandAllFiles();

        console.log('All files expanded, proceeding to extract data...');
        const extractedData = extractAllFilesData();

        if (extractedData.length > 0) {
            console.log('Extracted data:', extractedData);
            sendExtractedData(extractedData);
        } else {
            console.warn('No extracted data to send.');
        }
    })();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

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
                sendResponse({ success: false, error: error.message });
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

async function expandAndScrapeLargeFile(fileName, index, basePrUrl) {
    // Fetch `extractedDataByPr` from storage
    let extractedDataByPr = await getFromStorage('extractedDataByPr') || {};

    // Ensure `extractedData` exists for this base PR URL
    if (!extractedDataByPr[basePrUrl]) {
        extractedDataByPr[basePrUrl] = { extractedData: [] };
    }

    // Find the file element in the page that matches fileName
    const fileElements = document.querySelectorAll('.file');
    let fileFound = false;

    for (const fileElement of fileElements) {
        const fileNameElement = fileElement.querySelector('.file-info .Truncate a');
        if (fileNameElement && fileNameElement.textContent.trim() === fileName) {
            fileFound = true;
            // Check if it has a "Load diff" button
            const loadDiffButton = fileElement.querySelector('button.load-diff-button');

            if (loadDiffButton) {
                // Click the button to load the diff
                loadDiffButton.click();

                // Wait for the diff to load
                await waitForDiffToLoad(fileElement);
            }

            // Now, extract the file data
            const fileInfo = extractFileInfo(fileElement, index, true);

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
            await setInStorage({ extractedDataByPr });
            break;
        }
    }

    if (!fileFound) {
        throw new Error(`File ${fileName} not found on the page.`);
    }
}

// Helper function to wait for the diff to load
function waitForDiffToLoad(fileElement) {
    return new Promise((resolve, reject) => {
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