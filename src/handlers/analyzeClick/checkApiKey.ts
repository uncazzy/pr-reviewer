import { getModel, getProviderFromModel } from '@utils/storage';

interface StorageData {
    openaiApiKey?: string;
    deepseekApiKey?: string;
}

/**
 * Checks if the appropriate API key is set in chrome storage based on the selected model.
 * @throws {Error} If the required API key is not set
 * @returns A promise that resolves when the API key is found
 */
export async function checkApiKey(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const model = await getModel();
        const provider = getProviderFromModel(model);
        const storageKey = provider === 'deepseek' ? 'deepseekApiKey' : 'openaiApiKey';
        const providerName = provider === 'deepseek' ? 'DeepSeek' : 'OpenAI';

        chrome.storage.local.get(storageKey, (data: StorageData) => {
            const apiKey = provider === 'deepseek' ? data.deepseekApiKey : data.openaiApiKey;
            if (!apiKey) {
                alert(`Please set your ${providerName} API Key in the extension options.`);
                reject(new Error('API key not set'));
            } else {
                resolve();
            }
        });
    });
}