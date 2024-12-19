/**
 * Ensures that the current tab URL points to the '/files' page of a pull request.
 * If not, updates the URL and waits for the tab to finish loading.
 * 
 * @param currentUrl - The current URL of the tab
 * @param currentTabId - The ID of the current tab
 * @returns A promise that resolves with the updated tab if URL was changed, null otherwise
 */
export function ensureFilesTabUrl(
    currentUrl: string,
    currentTabId: number
): Promise<chrome.tabs.Tab | null> {
    return new Promise((resolve) => {
        let newUrl = currentUrl;
        if (!currentUrl.includes('/files')) {
            newUrl = currentUrl.replace('/commits', '/files').replace('/checks', '/files');
            newUrl = newUrl.match(/\/pull\/\d+$/) ? `${newUrl}/files` : newUrl;

            chrome.tabs.update(
                currentTabId,
                { url: newUrl },
                () => {
                    chrome.tabs.onUpdated.addListener(function listener(
                        tabId: number,
                        changeInfo: chrome.tabs.TabChangeInfo,
                        tab: chrome.tabs.Tab
                    ) {
                        if (tabId === currentTabId && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve(tab);
                        }
                    });
                }
            );
        } else {
            resolve(null);
        }
    });
}