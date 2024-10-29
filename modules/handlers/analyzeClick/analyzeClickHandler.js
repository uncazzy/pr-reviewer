import {
  checkApiKey,
  resetUI,
  getCurrentTabUrl,
} from './index.js'
import { getFromStorage } from '../../storage/index.js';
import { processFiles } from '../../files/processFiles.js';
import { createFilePicker } from '../../components/index.js';
import { getBaseUrl } from '../../result/index.js';

export async function handleAnalyzeClick(loadingDiv, analyzeButton, reanalyzeButton, resultDiv, filePickerDiv) {
  try {
    let { currentTab, currentUrl } = await getCurrentTabUrl();

    // Get the base version of the PR URL
    const basePrUrl = getBaseUrl(currentUrl);

    // Check if the button is in 'readyToAnalyze' state
    if (analyzeButton.dataset.state === 'readyToAnalyze') {
      loadingDiv.style.display = 'block';
      analyzeButton.disabled = true;

      // Get the latest extractedData for the current PR
      const extractedDataByPr = await getFromStorage('extractedDataByPr') || {};
      console.log('extractedDataByPr:', extractedDataByPr);
      const prData = extractedDataByPr[basePrUrl];
      console.log('prData:', prData);
      const extractedData = prData ? prData.extractedData : null;
      console.log('extractedData:', extractedData);

      if (!extractedData || extractedData.length === 0) {
        alert('No extracted data available. Please try analyzing the PR again.');
        analyzeButton.disabled = false;
        loadingDiv.style.display = 'none';
        return;
      }

      // Get selected files from the file picker
      const selectedFiles = getSelectedFiles(filePickerDiv, extractedData);

      if (selectedFiles.length === 0) {
        alert('Please select at least one file to analyze.');
        analyzeButton.disabled = false;
        loadingDiv.style.display = 'none';
        return;
      }

      // Process the selected files
      await processFiles(selectedFiles, basePrUrl);

      // Reset the button state
      analyzeButton.dataset.state = '';
      analyzeButton.textContent = 'Analyze PR';
      return;
    }

    // Proceed with navigation and file extraction as before
    // Update currentTab and currentUrl to the /files page
    if (!currentUrl.includes('/files')) {
      let newUrl = currentUrl.replace('/commits', '/files').replace('/checks', '/files');
      newUrl = currentUrl.match(/\/pull\/\d+$/) ? `${currentUrl}/files` : newUrl;

      chrome.tabs.update(currentTab.id, { url: newUrl });

      await waitForTabToLoad(currentTab.id);

      const updatedTabInfo = await getCurrentTabUrl();
      currentTab = updatedTabInfo.currentTab;
      currentUrl = updatedTabInfo.currentUrl;
    }

    // Trigger re-scraping by sending a message to the content script
    chrome.tabs.sendMessage(currentTab.id, { action: 'scrapeFiles' }, (response) => {
      console.log('Scraping response:', response);
      if (response && response.success) {
        console.log('Rescraping completed successfully.');
      } else {
        console.error('Error during scraping:', response ? response.error : 'Unknown error');
      }
    });

    await proceedToFileExtraction(
      basePrUrl,
      loadingDiv,
      analyzeButton,
      reanalyzeButton,
      resultDiv,
      filePickerDiv
    );

  } catch (error) {
    console.error('Error in handleAnalyzeClick:', error);
    analyzeButton.disabled = false;
    loadingDiv.style.display = 'none';
  }
}

// Helper function to proceed with file extraction and displaying the file picker
async function proceedToFileExtraction(basePrUrl, loadingDiv, analyzeButton, reanalyzeButton, resultDiv, filePickerDiv) {
  // Show loading, disable analyze button, hide reanalyze button
  loadingDiv.style.display = 'block';
  analyzeButton.disabled = true;
  reanalyzeButton.style.display = 'none'; // Ensure reanalyze button is hidden

  await checkApiKey();
  await resetUI(resultDiv, loadingDiv, analyzeButton);

  // // Wait for extractedData to be available
  const extractedData = await waitForExtractedData(basePrUrl);

  // Show the file picker
  if (extractedData && extractedData.length > 0) {
    await createFilePicker(filePickerDiv, extractedData);
    filePickerDiv.style.display = 'block';

    // Update icon and text content, then change the state
    analyzeButton.innerHTML = '<i class="fas fa-play"></i> Start Analysis';
    analyzeButton.title = 'Start analysis on selected files';
    analyzeButton.dataset.state = 'readyToAnalyze';

  } else {
    filePickerDiv.style.display = 'none';
  }

  analyzeButton.disabled = false;
  loadingDiv.style.display = 'none';
}

function waitForTabToLoad(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
}

async function waitForExtractedData(baseUrl) {
  return new Promise(async (resolve, reject) => {
    const maxAttempts = 20; // Wait up to 10 seconds
    let attempts = 0;

    const checkData = async () => {
      const data = await getFromStorage('extractedDataByPr');
      const extractedDataByPr = data || {};
      const extractedData = extractedDataByPr[baseUrl] && extractedDataByPr[baseUrl].extractedData;

      if (extractedData && extractedData.length > 0) {
        resolve(extractedData);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkData, 500);
        } else {
          reject('Timed out waiting for extractedData.');
        }
      }
    };
    checkData();
  });
}

// Helper function to get selected files from the file picker
function getSelectedFiles(filePickerDiv, extractedData) {
  const checkboxes = filePickerDiv.querySelectorAll('input[name="files"]:checked');
  const selectedFileNames = Array.from(checkboxes).map(cb => cb.value);

  // Filter the extractedData array to include only the selected files
  return extractedData.filter(file => selectedFileNames.includes(file.fileName));
}