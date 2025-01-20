import {
  checkApiKey,
  resetUI,
  getCurrentTabUrl,
} from './index.js'
import { getFromStorage } from '@utils/storage/index';
import { processFiles } from '@utils/api';
import { createFilePicker } from '@components/file/FilePicker';
import { getBaseUrl } from '@utils/results';

interface ExtractedData {
  fileName: string;
  filePath: string;
  isLargeFile?: boolean;
  fullContent: string;
  index?: number;
  [key: string]: any;  // For any additional properties
}

interface ExtractedDataByPr {
  [baseUrl: string]: {
    extractedData: ExtractedData[];
  };
}

/**
 * Handles the click event of the analyze button.
 */
export async function handleAnalyzeClick(
  loadingDiv: HTMLDivElement,
  analyzeButton: HTMLButtonElement,
  reanalyzeButton: HTMLButtonElement,
  resultDiv: HTMLDivElement,
  filePickerDiv: HTMLDivElement,
  errorMessageDiv: HTMLDivElement
): Promise<void> {
  try {
    const tabInfo = await getCurrentTabUrl();
    if (!tabInfo) {
      throw new Error('Could not get current tab information');
    }

    let { currentTab, currentUrl } = tabInfo;
    if (!currentUrl) {
      throw new Error('No URL found in current tab');
    }

    // Get the base version of the PR URL
    const basePrUrl = getBaseUrl(currentUrl);

    // Check if the button is in 'readyToAnalyze' state
    if (analyzeButton.dataset.state === 'readyToAnalyze') {
      loadingDiv.style.display = 'block';
      analyzeButton.disabled = true;

      // Get the latest extractedData for the current PR
      const extractedDataByPr = (await getFromStorage('extractedDataByPr') as ExtractedDataByPr) || {};

      const prData = extractedDataByPr[basePrUrl];

      const extractedData = prData ? prData.extractedData : null;


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
      const mappedSelectedFiles = selectedFiles.map((file, idx) => ({
        fileName: file.fileName,
        filePath: file.fileHref,
        fullContent: file.fullContent,
        fileHref: file.fileHref,
        index: file.index ?? idx
      }));

      await processFiles(mappedSelectedFiles, basePrUrl);

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

      chrome.tabs.update(currentTab.id!, { url: newUrl });

      await waitForTabToLoad(currentTab.id!);

      const updatedTabInfo = await getCurrentTabUrl();
      if (!updatedTabInfo) {
        throw new Error('Could not get updated tab information');
      }
      currentTab = updatedTabInfo.currentTab;
      currentUrl = updatedTabInfo.currentUrl;
    }

    // Trigger re-scraping by sending a message to the content script
    chrome.tabs.sendMessage(
      currentTab.id!,
      { action: 'scrapeFiles' },
      (response: { success: boolean; error?: string }) => {

        if (response && response.success) {
          // Sraping completed successfully
        } else {
          console.error('Error during scraping:', response ? response.error : 'Unknown error');
        }
      }
    );

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
    errorMessageDiv.style.display = 'flex';
  }
}

/**
 * Helper function to proceed with file extraction and displaying the file picker.
 */
async function proceedToFileExtraction(
  basePrUrl: string,
  loadingDiv: HTMLDivElement,
  analyzeButton: HTMLButtonElement,
  reanalyzeButton: HTMLButtonElement,
  resultDiv: HTMLDivElement,
  filePickerDiv: HTMLDivElement
): Promise<void> {
  // Show loading, disable analyze button, hide reanalyze button
  loadingDiv.style.display = 'block';
  analyzeButton.disabled = true;
  reanalyzeButton.style.display = 'none'; // Ensure reanalyze button is hidden

  await checkApiKey();
  await resetUI(resultDiv, loadingDiv, analyzeButton);

  // Wait for extractedData to be available
  const extractedData = await waitForExtractedData(basePrUrl);

  // Show the file picker
  if (extractedData && extractedData.length > 0) {
    // Transform the data to match ExtractedDataFile format
    const filePickerData = extractedData.map(file => ({
      ...file,
      fullContent: file.fullContent.split('\n')  // Convert string to string[]
    }));

    await createFilePicker(filePickerDiv, filePickerData);
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

/**
 * Waits for a tab to finish loading.
 */
function waitForTabToLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.onUpdated.addListener(function listener(
      updatedTabId: number,
      changeInfo: chrome.tabs.TabChangeInfo
    ) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
}

/**
 * Waits for extracted data to be available in storage using exponential backoff.
 * @param baseUrl - The base URL to fetch data for
 * @param maxWaitTime - Maximum time to wait in milliseconds (default: 10000ms)
 * @param initialDelay - Initial delay between attempts in milliseconds (default: 100ms)
 * @returns Promise resolving to ExtractedData array
 */
async function waitForExtractedData(
  baseUrl: string,
  maxWaitTime: number = 10000,
  initialDelay: number = 100
): Promise<ExtractedData[]> {
  const startTime = Date.now();
  let currentDelay = initialDelay;

  while (Date.now() - startTime < maxWaitTime) {
    const data = await getFromStorage('extractedDataByPr') as ExtractedDataByPr;
    const prData = data?.[baseUrl];
    const extractedData = prData?.extractedData;

    if (extractedData && Array.isArray(extractedData) && extractedData.length > 0) {
      return extractedData;
    }

    // Wait using exponential backoff
    await new Promise(resolve => setTimeout(resolve, currentDelay));
    currentDelay = Math.min(currentDelay * 2, 1000); // Double the delay, but cap at 1 second
  }

  throw new Error('Timed out waiting for extractedData');
}

/**
 * Helper function to get selected files from the file picker.
 */
function getSelectedFiles(
  filePickerDiv: HTMLDivElement,
  extractedData: ExtractedData[]
): ExtractedData[] {
  const checkboxes = filePickerDiv.querySelectorAll<HTMLInputElement>('input[name="files"]:checked');
  const selectedFileNames = Array.from(checkboxes).map(cb => cb.value);

  // Filter the extractedData array to include only the selected files
  return extractedData.filter(file => selectedFileNames.includes(file.fileName));
}