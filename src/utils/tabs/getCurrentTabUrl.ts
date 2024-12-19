interface TabInfo {
    currentTab: chrome.tabs.Tab;
    currentUrl: string | undefined;
}

export function getCurrentTabUrl(): Promise<TabInfo | null> {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (!currentTab) {
                reject(new Error('No active tab found'));
                return;
            }
            resolve({ currentTab, currentUrl: currentTab.url });
        });
    });
}
