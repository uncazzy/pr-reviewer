export function resetUI(resultDiv, loadingDiv, analyzeButton) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['prResults', 'processingComplete', 'extractedData'], () => {
        resultDiv.innerHTML = '';
        resultDiv.style.display = 'none';
        loadingDiv.style.display = 'block';
        analyzeButton.disabled = true;
        resolve();
      });
    });
  }
  