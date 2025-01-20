interface StorageData {
    openaiApiKey?: string;
}

/**
 * Checks if the OpenAI API key is set in chrome storage.
 * @throws {Error} If the API key is not set
 * @returns A promise that resolves when the API key is found
 */
export function checkApiKey(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        chrome.storage.local.get('openaiApiKey', (data: StorageData) => {
            if (!data.openaiApiKey) {
                alert('Please set your OpenAI API Key in the extension options.');
                reject(new Error('API key not set'));
            } else {
                resolve();
            }
        });
    });
}