import {
    expandAllFiles,
    extractAllFilesData,
    sendExtractedData
} from './modules/contentScript/index.js';

(async function () {
    console.log('Content script loaded');

    // First, expand all files
    await expandAllFiles();

    // Now proceed to extract file information
    const extractedData = extractAllFilesData();

    if (extractedData.length > 0) {
        sendExtractedData(extractedData);
    } else {
        console.warn('No extracted data to send.');
    }

})();