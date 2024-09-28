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
  