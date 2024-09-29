import { setInStorage , getCurrentPrUrl} from '../storage/index.js';
import { analyzeCodeWithGPT } from '../openai/api.js';
import { parseFeedback } from '../feedback/parseFeedback.js';

// Function to process files concurrently with controlled concurrency (using Promise.allSettled)
export async function processFiles(files) {
  const results = [];
  try {
    const prUrl = await getCurrentPrUrl().catch(() => 'Unknown PR URL'); // Default to placeholder if not found

    const promises = files.map((file) =>
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

    // Save results and PR URL to storage
    await setInStorage('prResults', results);
    await setInStorage('prUrl', prUrl);
    await setInStorage('processingComplete', true);
    console.log('Results and PR URL updated');
  } catch (error) {
    console.error('Unexpected error:', error);
    setInStorage('error', error.message || error);
  }
}
