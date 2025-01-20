import '@fortawesome/fontawesome-free/css/all.min.css';

interface StorageData {
    openaiApiKey?: string;
    openaiModel?: string;
}

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
    const saveApiKeyButton = document.getElementById('saveApiKey') as HTMLButtonElement;
    const clearApiKeyButton = document.getElementById('clearApiKey') as HTMLButtonElement;
    const saveModelButton = document.getElementById('saveModel') as HTMLButtonElement;
    const clearPrDataButton = document.getElementById('clearPrData') as HTMLButtonElement;
    const clearStorageButton = document.getElementById('clearStorage') as HTMLButtonElement;
    const overlayDiv = document.getElementById('overlay') as HTMLDivElement;
    const statusDiv = document.getElementById('status') as HTMLDivElement;
    const donateButton = document.getElementById('donateButton') as HTMLButtonElement;

    if (!apiKeyInput || !modelSelect || !saveApiKeyButton || !clearApiKeyButton ||
        !saveModelButton || !clearPrDataButton || !clearStorageButton ||
        !overlayDiv || !statusDiv || !donateButton) {
        console.error('Required DOM elements not found');
        return;
    }

    donateButton.addEventListener('click', handleDonation);

    // Load saved API key and model
    chrome.storage.local.get(['openaiApiKey', 'openaiModel'], (data: StorageData) => {
        if (data.openaiApiKey) {
            apiKeyInput.value = data.openaiApiKey;
        }
        if (data.openaiModel) {
            modelSelect.value = data.openaiModel;
        } else {
            // Set default model if not already set
            const defaultModel = "gpt-4o-mini";
            modelSelect.value = defaultModel;
            chrome.storage.local.set({ 'openaiModel': defaultModel });
        }
    });

    // Event listener for the "Save API Key" button
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        chrome.storage.local.set({ 'openaiApiKey': apiKey }, () => {
            statusDiv.style.display = 'flex';
            overlayDiv.style.display = 'block';
            updateStatus('API Key saved.');
        });
    });

    // Event listener for the "Clear API Key" button
    clearApiKeyButton.addEventListener('click', () => {
        apiKeyInput.value = '';
        chrome.storage.local.remove('openaiApiKey', () => {
            statusDiv.style.display = 'flex';
            overlayDiv.style.display = 'block';
            updateStatus('API Key cleared.');
        });
    });

    // Event listener for the "Save Model Selection" button
    saveModelButton.addEventListener('click', () => {
        const selectedModel = modelSelect.value;
        chrome.storage.local.set({ 'openaiModel': selectedModel }, () => {
            statusDiv.style.display = 'flex';
            overlayDiv.style.display = 'block';
            updateStatus('Model selection saved.');
        });
    });

    // Event listener for the "Delete All PR Data" button
    clearPrDataButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all stored PR data? This action cannot be undone.')) {
            statusDiv.style.display = 'flex';
            overlayDiv.style.display = 'block';
            updateStatus('All stored PR data has been cleared.');


            // Remove multiple keys from storage
            const keysToRemove: string[] = ['extractedDataByPr', 'apiMessagesHistory', 'chatHistory', 'processingComplete'];
            chrome.storage.local.remove(keysToRemove, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error deleting PR data:', chrome.runtime.lastError);
                    updateStatus('An error occurred while deleting PR data.');
                } else {
                    updateStatus('All specified PR data has been cleared.');

                }
            });
        }
    });

    // Event listener for the "Clear All Stored Data" button
    clearStorageButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
            chrome.storage.local.clear(() => {
                statusDiv.style.display = 'flex';
                overlayDiv.style.display = 'block';
                apiKeyInput.value = '';
                modelSelect.value = 'gpt-4o-mini'; // Reset to default
                updateStatus('All stored data has been cleared.');
            });
        }
    });

    function updateStatus(message: string): void {
        statusDiv.textContent = message;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.style.display = 'none';
            overlayDiv.style.display = 'none';
        }, 2000);
    }

    function handleDonation(): void {
        const donationUrl = 'https://buymeacoffee.com/azurd';
        chrome.tabs.create({ url: donationUrl, active: true });
    }
});
