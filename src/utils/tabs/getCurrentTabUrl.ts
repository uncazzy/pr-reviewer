interface TabInfo {
    currentTab: chrome.tabs.Tab;
    currentUrl: string | undefined;
}

export function getCurrentTabUrl(): Promise<TabInfo | null> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const currentTab = tabs[0];
                resolve({ currentTab, currentUrl: currentTab.url });
            } else {
                resolve(null);
            }
        });
    });
}
