export function executeContentScript(tabId) {
    return new Promise((resolve) => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['dist/contentScript.bundle.js'],
      }, () => {
        console.log("Content script executed on /files tab");
        resolve();
      });
    });
  }
  