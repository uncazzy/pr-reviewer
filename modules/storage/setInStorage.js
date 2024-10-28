export function setInStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(`Failed to set data in storage: ${chrome.runtime.lastError.message}`);
      } else {
        resolve();
      }
    });
  });
}