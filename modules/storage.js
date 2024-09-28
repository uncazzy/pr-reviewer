import { displaySavedResults } from "../modules/result/result.js"

// Function to handle changes in chrome.storage
export function handleStorageChanges(changes, area) {
  if (area === 'local') {
    const loadingDiv = document.getElementById('loading');
    const analyzeButton = document.getElementById('analyze');
    const resultDiv = document.getElementById('result');

    if (!loadingDiv || !analyzeButton || !resultDiv) {
      console.error('One or more elements are not defined in the DOM.');
      return;
    }

    if (changes.prResults) {
      const results = changes.prResults.newValue;
      displaySavedResults(results, resultDiv); // Display the stored results when they change
    }
    if (changes.processingComplete) {
      loadingDiv.style.display = 'none';
      analyzeButton.disabled = false;
    }
    if (changes.error) {
      loadingDiv.style.display = 'none';
      analyzeButton.disabled = false;
      alert(changes.error.newValue);
      chrome.storage.local.remove('error'); // Clear the error to avoid repeated alerts
      resultDiv.style.display = 'none';
    }
  }
}

// Function to retrieve a value from storage
export function getFromStorage(keys) {
  // Ensure keys is an array, if not, convert it to an array
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (data) => {
      if (chrome.runtime.lastError) {
        reject(`Storage Error: ${chrome.runtime.lastError.message}`);
      } else {
        // Check for missing keys and set them to empty values if not found
        const missingKeys = keys.filter(key => !(key in data));

        // If there are missing keys, log a warning and initialize them to empty objects/arrays
        if (missingKeys.length > 0) {
          console.warn(`Keys missing in storage: ${missingKeys}. Initializing missing keys with default values.`);
          missingKeys.forEach(key => {
            data[key] = key === 'detailedFeedback' ? {} : []; // Initialize 'detailedFeedback' as an empty object and others as arrays
          });
        }

        resolve(data);
      }
    });
  });
}

// Function to set a value in storage
export function setInStorage(key, value) {
  return new Promise((resolve, reject) => {
    const data = {};
    data[key] = value;
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(`Failed to set ${key} in storage: ${chrome.runtime.lastError.message}`);
      } else {
        resolve();
      }
    });
  });
}

// Function to remove a key from storage
export function removeFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(`Failed to remove ${key} from storage: ${chrome.runtime.lastError.message}`);
      } else {
        resolve();
      }
    });
  });
}

// Function to retrieve API key from storage
export async function getApiKey() {
  const data = await getFromStorage('openaiApiKey');
  return data.openaiApiKey;  // Extract and return the value, not the object
}

// Function to retrieve OpenAI model from storage
export async function getModel() {
  const data = await getFromStorage('openaiModel').catch(() => ({ openaiModel: 'gpt-4o-mini' }));
  return data.openaiModel;  // Extract and return the value, not the object
}

// Function to get current PR URL from storage
export async function getCurrentPrUrl() {
  const data = await getFromStorage('currentPrUrl');
  return data.currentPrUrl;  // Extract and return the value, not the object
}