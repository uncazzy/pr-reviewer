import { initializeFeedbackListener } from "./modules/feedback/messageListener.js"
import { getDetailedFeedback } from "./modules/feedback.js";
import { getApiKey, getModel, setInStorage, getCurrentPrUrl } from './modules/storage.js';
import { createReviewPrompt } from "./prompts/reviewPrompt.js"

// Initialize the listener for feedback-related messages
initializeFeedbackListener();

// Store extractedData globally
let extractedData = [];

// Combined listener for messages from contentScript.js, detailedFeedback.js, or other sources
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.files) {
    // Handle the message containing files (contentScript.js)
    extractedData = message.files;

    // Save extractedData to local storage
    setInStorage('extractedData', extractedData)
      .then(() => console.log('Extracted data saved to local storage'))
      .catch(console.error);

    processFiles(message.files);
  } else if (message.action === 'getDetailedFeedback') {
    // Handle the message for getting detailed feedback (detailedFeedback.js)
    getDetailedFeedback(message.fileName)
      .then((feedback) => {
        sendResponse({ detailedFeedback: feedback });
      })
      .catch((error) => {
        console.error('Error in getDetailedFeedback:', error);
        sendResponse({ error: 'Failed to get detailed feedback' });
      });
    return true; // Indicates that the response is sent asynchronously
  }
});

// Function to process files concurrently with controlled concurrency (using Promise.allSettled)
async function processFiles(files) {
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

// Helper function to retry with exponential backoff
async function retryWithBackoff(fn, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error; // Rethrow the error after max retries
      }
    }
  }
}

// Function to send a code review request to OpenAI
async function analyzeCodeWithGPT(fileName, oldCode, newCode, fullFileContent) {
  console.log(`Analyzing file: ${fileName}`);
  const prompt = createReviewPrompt(fileName, oldCode, newCode, fullFileContent);
  console.log('Prompt being sent to OpenAI:', prompt);

  const apiCall = async () => {
    const apiKey = await getApiKey();
    const model = await getModel();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are an expert code reviewer with advanced knowledge of software development practices.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(`OpenAI API Error: ${data.error.message}`);
    return data.choices[0].message.content;
  };

  return retryWithBackoff(apiCall);
}

// Function to parse the feedback from GPT-4
function parseFeedback(feedback) {
  const statusMatch = feedback.match(/- \*\*Status\*\*: (.*)/i);
  const issueMatch = feedback.match(/- \*\*Issue\*\*: (.*)/i);

  return {
    status: statusMatch ? statusMatch[1].trim() : 'Requires Changes',
    issue: issueMatch ? issueMatch[1].trim() : '',
  };
}
