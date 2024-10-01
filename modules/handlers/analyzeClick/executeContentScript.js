export function executeContentScript(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ['dist/contentScript.bundle.js'],
      },
      (results) => {
        if (chrome.runtime.lastError) {
          console.error('Error executing content script:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log('Content script executed on current tab');
          resolve();
        }
      }
    );
  });
}