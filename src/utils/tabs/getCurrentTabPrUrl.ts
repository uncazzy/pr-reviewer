import { getBaseUrl } from "@utils/results";

export async function getCurrentTabPrUrl(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && tabs[0]?.url) {
                const currentUrl = tabs[0].url;
                const baseUrl = getBaseUrl(currentUrl);
                resolve(baseUrl);
            } else {
                resolve(null);
            }
        });
    });
}
