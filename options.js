document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('modelSelect');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearApiKeyButton = document.getElementById('clearApiKey');
    const saveModelButton = document.getElementById('saveModel');
    const clearPrDataButton = document.getElementById('clearPrData');
    const clearStorageButton = document.getElementById('clearStorage');
    const overlayDiv = document.getElementById('overlay');
    const statusDiv = document.getElementById('status');
    const donateButton = document.getElementById('donateButton');

    donateButton.addEventListener('click', handleDonation);

    // Load saved API key and model
    chrome.storage.local.get(['openaiApiKey', 'openaiModel'], (data) => {
        if (data.openaiApiKey) {
            apiKeyInput.value = data.openaiApiKey;
        }
        if (data.openaiModel) {
            modelSelect.value = data.openaiModel;
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
            console.log('Deleting all stored PR data...');

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

    function updateStatus(message) {
        statusDiv.textContent = message;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.style.display = 'none';
            overlayDiv.style.display = 'none';
        }, 2000);
    }

    function handleDonation() {
        const donationUrl = 'https://buymeacoffee.com/azurd';
        chrome.tabs.create({ url: donationUrl, active: true });
    }
});
