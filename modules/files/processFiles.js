import { setInStorage } from '../storage/index.js';
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
          return { fileName: file.fileName, status: parsedFeedback.status, issue: parsedFeedback.issue, index: file.index };
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

    // Retrieve existing allPrResults from storage
    const { allPrResults = {} } = await chrome.storage.local.get('allPrResults');

    // Update the allPrResults object with the new results for the current PR
    allPrResults[prUrl] = results;

    // Save updated allPrResults to storage
    await setInStorage('allPrResults', allPrResults);

    // Save processingComplete flag
    await setInStorage('processingComplete', true);

    console.log('Results and PR URL updated');
  } catch (error) {
    console.error('Unexpected error:', error);
    setInStorage('error', error.message || error);
  }
}
