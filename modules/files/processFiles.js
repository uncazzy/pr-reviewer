import { setInStorage, getFromStorage } from '../storage/index.js';
import { analyzeCodeWithGPT } from '../openai/api.js';
import { parseFeedback } from '../feedback/parseFeedback.js';

// Function to process files concurrently
export async function processFiles(selectedFiles, prUrl) {
  const results = [];
  try {
    const promises = selectedFiles.map((file) =>
      analyzeCodeWithGPT(file.fileName, file.oldCode, file.newCode, file.fullContent)
        .then((feedback) => {
          const parsedFeedback = parseFeedback(feedback);
          const fileURL = prUrl + '/files' + file.fileHref;
          return { fileName: file.fileName, fileURL, status: parsedFeedback.status, issue: parsedFeedback.issue, index: file.index };
        })
        .catch((error) => ({ fileName: file.fileName, status: 'Error', issue: error.message }))
    );

    const settledPromises = await Promise.allSettled(promises);
    settledPromises.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.warn('File processing failed:', result.reason);
      }
    });

    // Retrieve existing extractedDataByPr from storage
    const extractedDataByPr = await getFromStorage('extractedDataByPr') || {};

    // Ensure prData exists
    if (!extractedDataByPr[prUrl]) {
      extractedDataByPr[prUrl] = {};
    }

    // Save the results
    extractedDataByPr[prUrl].results = results;

    // Save updated extractedDataByPr to storage
  
    await setInStorage({ extractedDataByPr });

    // Save processingComplete flag
    await setInStorage({ processingComplete: true });

    console.log('Results and PR URL updated');
  } catch (error) {
    console.error('Unexpected error:', error);
    await setInStorage({ error: error.message || error });
  }
}
