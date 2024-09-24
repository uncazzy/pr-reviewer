function handleAnalyzeClick() {
    chrome.storage.local.get('openaiApiKey', (data) => {
        if (!data.openaiApiKey) {
            alert('Please set your OpenAI API Key in the extension options.');
            return;
        }

        chrome.storage.local.remove(['prResults', 'processingComplete', 'extractedData'], () => {
            resultDiv.innerHTML = '';
            resultDiv.style.display = 'none';
            loadingDiv.style.display = 'block';
            analyzeButton.disabled = true;

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const currentTab = tabs[0];
                let currentUrl = currentTab.url;

                chrome.storage.local.set({ 'currentPrUrl': currentUrl }, () => {
                    // Check if the current URL includes '/files'
                    if (!currentUrl.includes('/files')) {
                        // Replace "commits" or "checks" with "files" in the URL
                        currentUrl = currentUrl.replace('/commits', '/files').replace('/checks', '/files');

                        // If the current URL doesn't end with '/files' or any specific tab, append '/files'
                        const filesUrl = currentUrl.match(/\/pull\/\d+$/) ? `${currentUrl}/files` : currentUrl;

                        // Update the tab with the new URL
                        chrome.tabs.update(currentTab.id, { url: filesUrl }, () => {
                            // Listen for the tab to finish loading
                            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
                                if (tabId === currentTab.id && changeInfo.status === 'complete') {
                                    // Remove the listener to prevent multiple triggers
                                    chrome.tabs.onUpdated.removeListener(listener);
                                    // Execute the content script
                                    chrome.scripting.executeScript({
                                        target: { tabId: tab.id },
                                        files: ['contentScript.js']
                                    }, () => {
                                        console.log("Content script executed on /files tab");
                                    });
                                }
                            });
                        });
                    } else {
                        // Already on the '/files' tab, execute the content script directly
                        chrome.scripting.executeScript({
                            target: { tabId: currentTab.id },
                            files: ['contentScript.js']
                        }, () => {
                            console.log("Content script executed on /files tab");
                        });
                    }
                });
            });
        });
    });
}