import { handleAnalyzeClick } from './modules/handlers/analyzeClick/index.js';
import { handleStorageChanges, setInStorage } from './modules/storage/index.js';
import { getBaseUrl, checkForResults  } from "./modules/result/index.js";
import { createFilePicker } from './modules/components/index.js';

const analyzeButton = document.getElementById('analyze');
const reanalyzeButton = document.getElementById('reanalyze');
const settingsButton = document.getElementById('settings-button');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const filePickerDiv = document.getElementById('file-picker');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePopup);
analyzeButton.addEventListener('click', async () => {
    await handleAnalyzeClick(loadingDiv, analyzeButton, reanalyzeButton, resultDiv, filePickerDiv);
});

chrome.storage.onChanged.addListener(handleStorageChanges);

reanalyzeButton.addEventListener('click', async () => {
    await resetUI();
    await initializePopup();
});

settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();  // Opens the options page
});

// Initialization
async function initializePopup() {
    const { hasResults, hasExtractedData } = await checkGitHubPRPage();

    if (hasResults) {
        analyzeButton.style.display = 'none';
        reanalyzeButton.style.display = 'inline-block';
        filePickerDiv.style.display = 'none';
    } else if (hasExtractedData) {
        analyzeButton.style.display = 'inline-block';
        reanalyzeButton.style.display = 'none';
        await displayFilePicker();
    } else {
        analyzeButton.style.display = 'inline-block';
        reanalyzeButton.style.display = 'none';
        filePickerDiv.style.display = 'none';
    }

    initializeSyntaxHighlighting();
}

async function checkGitHubPRPage() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;
            const isPRPage = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(currentUrl);
            analyzeButton.disabled = !isPRPage;

            if (isPRPage) {
                const { hasResults, hasExtractedData } = await checkForResults(currentUrl, resultDiv, filePickerDiv);
                resolve({ hasResults, hasExtractedData });
            } else {
                resultDiv.innerHTML = '<p style="text-align: center;">Please navigate to a GitHub pull request page to use this extension.</p>';
                filePickerDiv.style.display = 'none';
                resolve({ hasResults: false, hasExtractedData: false });
            }
        });
    });
}

function initializeSyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    } else {
        console.error('Highlight.js is not loaded');
    }
}

async function checkForExtractedData() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;
            const baseUrl = getBaseUrl(currentUrl);

            chrome.storage.local.get(['extractedDataByPr'], (data) => {
                const extractedDataByPr = data.extractedDataByPr || {};
                const prData = extractedDataByPr[baseUrl];
                const hasExtractedData = prData && prData.extractedData && prData.extractedData.length > 0;
                resolve(hasExtractedData);
            });
        });
    });
}

async function displayFilePicker() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const currentTab = tabs[0];
        const currentUrl = currentTab.url;
        const baseUrl = getBaseUrl(currentUrl);

        chrome.storage.local.get(['extractedDataByPr'], async (data) => {
            const extractedDataByPr = data.extractedDataByPr || {};
            const prData = extractedDataByPr[baseUrl];
            const extractedData = prData ? prData.extractedData : null;

            if (extractedData && extractedData.length > 0) {
                await createFilePicker(filePickerDiv, extractedData);
                filePickerDiv.style.display = 'block';
                analyzeButton.innerHTML = '<i class="fas fa-play"></i> Start Analysis';
                analyzeButton.title = 'Start analysis on selected files';
                analyzeButton.dataset.state = 'readyToAnalyze';
            } else {
                filePickerDiv.style.display = 'none';
            }
        });
    });
}

async function resetUI() {
    // Get the current PR URL
    const currentUrl = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].url);
        });
    });

    const basePrUrl = getBaseUrl(currentUrl);

    // Retrieve existing extractedDataByPr from storage
    const { extractedDataByPr = {} } = await chrome.storage.local.get(['extractedDataByPr']);

    // Remove results for the current PR but keep extractedData
    if (extractedDataByPr[basePrUrl]) {
        delete extractedDataByPr[basePrUrl].results;
    }

    // Save updated data back to storage
    await setInStorage('extractedDataByPr', extractedDataByPr);

    // Also remove processingComplete flag
    await new Promise((resolve) => {
        chrome.storage.local.remove(['processingComplete'], resolve);
    });

    // Reset UI elements
    resultDiv.innerHTML = '';
    resultDiv.style.display = 'none';
    filePickerDiv.innerHTML = '';
    analyzeButton.disabled = false;
    analyzeButton.style.display = 'inline-block';
    analyzeButton.innerHTML = '<i class="fas fa-play"></i> Start Analysis';
    analyzeButton.title = 'Start analysis on selected files';
    reanalyzeButton.style.display = 'none';

    // Display file picker if extracted data exists
    const hasExtractedData = await checkForExtractedData();
    if (hasExtractedData) {
        await displayFilePicker();
    } else {
        filePickerDiv.style.display = 'none';
    }
}