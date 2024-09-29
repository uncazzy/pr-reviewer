export function ensureFilesTabUrl(currentUrl, currentTabId) {
    return new Promise((resolve) => {
      let newUrl = currentUrl;
      if (!currentUrl.includes('/files')) {
        newUrl = currentUrl.replace('/commits', '/files').replace('/checks', '/files');
        newUrl = newUrl.match(/\/pull\/\d+$/) ? `${newUrl}/files` : newUrl;
  
        chrome.tabs.update(currentTabId, { url: newUrl }, () => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
            if (tabId === currentTabId && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve(tab);
            }
          });
        });
      } else {
        resolve(null);
      }
    });
  }
  