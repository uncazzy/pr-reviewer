export function checkApiKey() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('openaiApiKey', (data) => {
        if (!data.openaiApiKey) {
          alert('Please set your OpenAI API Key in the extension options.');
          reject('API key not set');
        } else {
          resolve();
        }
      });
    });
  }
  