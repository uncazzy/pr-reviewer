import '@fortawesome/fontawesome-free/css/all.min.css';
import { getProviderFromModel } from '@utils/storage';

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const deepseekApiKeyInput = document.getElementById('deepseekApiKey') as HTMLInputElement;
    const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
    const saveApiKeyButton = document.getElementById('saveApiKey') as HTMLButtonElement;
    const saveDeepseekApiKeyButton = document.getElementById('saveDeepseekApiKey') as HTMLButtonElement;
    const clearApiKeyButton = document.getElementById('clearApiKey') as HTMLButtonElement;
    const clearDeepseekApiKeyButton = document.getElementById('clearDeepseekApiKey') as HTMLButtonElement;
    const saveModelButton = document.getElementById('saveModel') as HTMLButtonElement;
    const clearPrDataButton = document.getElementById('clearPrData') as HTMLButtonElement;
    const clearStorageButton = document.getElementById('clearStorage') as HTMLButtonElement;
    const overlayDiv = document.getElementById('overlay') as HTMLDivElement;
    const statusDiv = document.getElementById('status') as HTMLDivElement;
    const donateButton = document.getElementById('donateButton') as HTMLButtonElement;

    if (!apiKeyInput || !deepseekApiKeyInput || !modelSelect || 
        !saveApiKeyButton || !saveDeepseekApiKeyButton || !clearApiKeyButton || !clearDeepseekApiKeyButton || 
        !saveModelButton || !clearPrDataButton || !clearStorageButton ||
        !overlayDiv || !statusDiv || !donateButton) {
        console.error('Required DOM elements not found');
        return;
    }

    // Load saved values
    chrome.storage.local.get(['openaiApiKey', 'deepseekApiKey', 'selectedModel'], (result) => {
        if (result.openaiApiKey) {
            apiKeyInput.value = result.openaiApiKey;
        }
        if (result.deepseekApiKey) {
            deepseekApiKeyInput.value = result.deepseekApiKey;
        }
        if (result.selectedModel) {
            modelSelect.value = result.selectedModel;
        }
    });

    // Save OpenAI API key
    saveApiKeyButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        await chrome.storage.local.set({ openaiApiKey: apiKey });
        showSuccessMessage('OpenAI API key saved successfully!');
    });

    // Save DeepSeek API key
    saveDeepseekApiKeyButton.addEventListener('click', async () => {
        const apiKey = deepseekApiKeyInput.value.trim();
        await chrome.storage.local.set({ deepseekApiKey: apiKey });
        showSuccessMessage('DeepSeek API key saved successfully!');
    });

    // Clear OpenAI API key
    clearApiKeyButton.addEventListener('click', async () => {
        await chrome.storage.local.remove('openaiApiKey');
        apiKeyInput.value = '';
        showSuccessMessage('OpenAI API key cleared successfully!');
    });

    // Clear DeepSeek API key
    clearDeepseekApiKeyButton.addEventListener('click', async () => {
        await chrome.storage.local.remove('deepseekApiKey');
        deepseekApiKeyInput.value = '';
        showSuccessMessage('DeepSeek API key cleared successfully!');
    });

    // Save model selection
    saveModelButton.addEventListener('click', async () => {
        const selectedModel = modelSelect.value;
        const provider = getProviderFromModel(selectedModel);
        
        // Check if the required API key is set
        const apiKey = provider === 'deepseek' ? deepseekApiKeyInput.value : apiKeyInput.value;
        if (!apiKey.trim()) {
            showErrorMessage(`${provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API key is required for this model.`);
            return;
        }

        await chrome.storage.local.set({ selectedModel });
        showSuccessMessage('Model selection saved successfully!');
    });

    // Clear all stored data
    clearStorageButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
            chrome.storage.local.clear(() => {
                apiKeyInput.value = '';
                deepseekApiKeyInput.value = '';
                modelSelect.value = 'gpt-4o-mini'; // Reset to default
                showSuccessMessage('All stored data has been cleared.');
            });
        }
    });

    // Handle donation button click
    donateButton.addEventListener('click', handleDonation);

    function showSuccessMessage(message: string): void {
        statusDiv.textContent = message;
        statusDiv.style.display = 'flex';
        overlayDiv.style.display = 'block';
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.style.display = 'none';
            overlayDiv.style.display = 'none';
        }, 2000);
    }

    function showErrorMessage(message: string): void {
        statusDiv.textContent = message;
        statusDiv.style.display = 'flex';
        overlayDiv.style.display = 'block';
        statusDiv.style.color = 'var(--danger-color)';
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.style.display = 'none';
            overlayDiv.style.display = 'none';
            statusDiv.style.color = 'var(--text-color)';
        }, 3000);
    }
});

function handleDonation(): void {
    const donationUrl = 'https://buymeacoffee.com/azurd';
    chrome.tabs.create({ url: donationUrl, active: true });
}
