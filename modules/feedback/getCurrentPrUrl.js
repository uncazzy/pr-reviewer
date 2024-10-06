import { getBaseUrl } from "../result/index.js";

export async function getCurrentPrUrl() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
                const currentUrl = tabs[0].url;
                const baseUrl = getBaseUrl(currentUrl);
                resolve(baseUrl);
            } else {
                resolve(null);
            }
        });
    });
}