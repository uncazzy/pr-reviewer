import {
    expandAllFiles,
    extractAllFilesData,
    sendExtractedData
} from './modules/contentScript/index.js';

(async function () {
    console.log('Content script loaded');

    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading' || document.readyState === 'interactive') {
        console.log('Waiting for DOM to fully load...');
        await new Promise((resolve) => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }

    console.log('DOM fully loaded, expanding files...');

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