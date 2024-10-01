import {
  checkApiKey,
  resetUI,
  getCurrentTabUrl,
  ensureFilesTabUrl,
  executeContentScript,
} from './index.js'
import { getFromStorage, setInStorage } from '../../storage/index.js';
import { processFiles } from '../../files/processFiles.js';

export async function handleAnalyzeClick(loadingDiv, analyzeButton, resultDiv, filePickerDiv) {
  try {
    // Show loading, disable analyze button, hide reanalyze button
    loadingDiv.style.display = 'block';
    analyzeButton.disabled = true;
    document.getElementById('reanalyze').style.display = 'none';
    
    await checkApiKey();
    await resetUI(resultDiv, loadingDiv, analyzeButton);

    const { currentTab, currentUrl } = await getCurrentTabUrl();
    await setInStorage('currentPrUrl', currentUrl);

    const updatedTab = await ensureFilesTabUrl(currentUrl, currentTab.id);
    const tabToUse = updatedTab || currentTab;

    // Execute content script to extract files if not already done
    const { extractedData } = await getFromStorage('extractedData');
    if (!extractedData || extractedData.length === 0) {
      await executeContentScript(tabToUse.id);
      // Wait for extractedData to be available
      await waitForExtractedData();
    }

    // Get the latest extractedData
    const { extractedData: files } = await getFromStorage('extractedData');

    // Get selected files from the file picker
    const selectedFiles = getSelectedFiles(filePickerDiv, files);

    if (selectedFiles.length === 0) {
      alert('Please select at least one file to analyze.');
      analyzeButton.disabled = false;
      loadingDiv.style.display = 'none';
      return;
    }

    // Process the selected files
    await processFiles(selectedFiles, currentUrl);

  } catch (error) {
    console.error('Error in handleAnalyzeClick:', error);
    analyzeButton.disabled = false;
    loadingDiv.style.display = 'none';
  }
}

// Helper function to wait for extractedData to be available
function waitForExtractedData() {
  return new Promise((resolve, reject) => {
    const maxAttempts = 20; // Wait up to 10 seconds
    let attempts = 0;

    const checkData = () => {
      chrome.storage.local.get('extractedData', (data) => {
        if (data.extractedData && data.extractedData.length > 0) {
          resolve();
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkData, 500);
          } else {
            reject('Timed out waiting for extractedData.');
          }
        }
      });
    };
    checkData();
  });
}

// Helper function to get selected files from the file picker
function getSelectedFiles(filePickerDiv, allFiles) {
  const checkboxes = filePickerDiv.querySelectorAll('input[name="files"]:checked');
  const selectedFileNames = Array.from(checkboxes).map(cb => cb.value);

  // Filter the allFiles array to include only the selected files
  return allFiles.filter(file => selectedFileNames.includes(file.fileName));
}