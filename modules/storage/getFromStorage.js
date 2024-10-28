export function getFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (data) => {
      if (chrome.runtime.lastError) {
        reject(`Storage Error: ${chrome.runtime.lastError.message}`);
      } else {
        resolve(data[key]);
      }
    });
  });
}
