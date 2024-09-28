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
  