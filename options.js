document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    chrome.storage.local.set({ 'openaiApiKey': apiKey }, () => {
        const status = document.getElementById('status');
        status.textContent = 'API Key saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

// Load saved API key on page load
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('openaiApiKey', (data) => {
        if (data.openaiApiKey) {
            document.getElementById('apiKey').value = data.openaiApiKey;
        }
    });
});
