export function getCurrentTabUrl() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        resolve({ currentTab, currentUrl: currentTab.url });
      });
    });
  }
  