document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('modelSelect');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearApiKeyButton = document.getElementById('clearApiKey');
    const saveModelButton = document.getElementById('saveModel');
    const clearStorageButton = document.getElementById('clearStorage');
    const statusDiv = document.getElementById('status');

    // Load saved API key and model
    chrome.storage.local.get(['openaiApiKey', 'openaiModel'], (data) => {
        if (data.openaiApiKey) {
            apiKeyInput.value = data.openaiApiKey;
        }
        if (data.openaiModel) {
            modelSelect.value = data.openaiModel;
        }
    });

    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        chrome.storage.local.set({ 'openaiApiKey': apiKey }, () => {
            updateStatus('API Key saved.');
        });
    });

    clearApiKeyButton.addEventListener('click', () => {
        apiKeyInput.value = '';
        chrome.storage.local.remove('openaiApiKey', () => {
            updateStatus('API Key cleared.');
        });
    });

    saveModelButton.addEventListener('click', () => {
        const selectedModel = modelSelect.value;
        chrome.storage.local.set({ 'openaiModel': selectedModel }, () => {
            updateStatus('Model selection saved.');
        });
    });

    clearStorageButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
            chrome.storage.local.clear(() => {
                apiKeyInput.value = '';
                modelSelect.value = 'gpt-4'; // Reset to default
                updateStatus('All stored data has been cleared.');
            });
        }
    });

    function updateStatus(message) {
        statusDiv.textContent = message;
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 3000);
    }
});
