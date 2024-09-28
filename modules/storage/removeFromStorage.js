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
  