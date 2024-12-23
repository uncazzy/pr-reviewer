import '@fortawesome/fontawesome-free/css/all.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css'

import { handleAnalyzeClick } from '@handlers/analyzeClick';
import { handleStorageChanges, setInStorage } from '@utils/storage';
import { getBaseUrl, checkForResults } from '@utils/results';
import { createFilePicker } from '@components/file/FilePicker';

interface ExtractedData {
    fileName: string;
    fullContent: string;
    fileHref: string;
    [key: string]: unknown;
}

interface ExtractedDataFile {
    fileName: string;
    fullContent: string[];
    filePath: string;
}

interface PRData {
    extractedData?: ExtractedData[];
    results?: unknown;
}

interface ExtractedDataByPr {
    [baseUrl: string]: PRData;
}

interface CheckResults {
    hasResults: boolean;
    hasExtractedData: boolean;
}

const analyzeButton = document.getElementById('analyze') as HTMLButtonElement;
const reanalyzeButton = document.getElementById('reanalyze') as HTMLButtonElement;
const settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const loadingDiv = document.getElementById('loading') as HTMLDivElement;
const filePickerDiv = document.getElementById('file-picker') as HTMLDivElement;

if (!analyzeButton || !reanalyzeButton || !settingsButton || !resultDiv || !loadingDiv || !filePickerDiv) {
    throw new Error('Required DOM elements not found');
}

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
async function initializePopup(): Promise<void> {
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

async function checkGitHubPRPage(): Promise<CheckResults> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const currentTab = tabs[0];
            if (!currentTab) {
                resolve({ hasResults: false, hasExtractedData: false });
                return;
            }

            const currentUrl = currentTab.url;
            if (!currentUrl) {
                resolve({ hasResults: false, hasExtractedData: false });
                return;
            }

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

function initializeSyntaxHighlighting(): void {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    } else {
        console.error('Highlight.js is not loaded');
    }
}

async function checkForExtractedData(): Promise<boolean> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (!currentTab) {
                resolve(false);
                return;
            }

            const currentUrl = currentTab.url;
            if (!currentUrl) {
                resolve(false);
                return;
            }

            const baseUrl = getBaseUrl(currentUrl);

            chrome.storage.local.get(['extractedDataByPr'], (data: { extractedDataByPr?: ExtractedDataByPr }) => {
                const extractedDataByPr = data.extractedDataByPr || {};
                const prData = extractedDataByPr[baseUrl];
                const hasExtractedData = Boolean(prData?.extractedData && prData.extractedData.length > 0);
                resolve(hasExtractedData);
            });
        });
    });
}

async function displayFilePicker(): Promise<void> {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab) {
            return;
        }

        const currentUrl = currentTab.url;
        if (!currentUrl) {
            return;
        }

        const baseUrl = getBaseUrl(currentUrl);
        chrome.storage.local.get(['extractedDataByPr'], async (data: { extractedDataByPr?: ExtractedDataByPr }) => {
            const extractedDataByPr = data.extractedDataByPr || {};
            const prData = extractedDataByPr[baseUrl];
            const extractedData = prData?.extractedData;

            if (extractedData && extractedData.length > 0) {
                // Transform the data to match ExtractedDataFile format
                const transformedData: ExtractedDataFile[] = extractedData.map(data => ({
                    fileName: data.fileName,
                    filePath: data.fileHref,
                    fullContent: data.fullContent.split('\n'),
                    isLargeFile: data.isLargeFile
                }));

                await createFilePicker(filePickerDiv, transformedData);
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

async function resetUI(): Promise<void> {
    // Get the current PR URL
    const currentUrl = await new Promise<string | undefined>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (!currentTab?.url) {
                resolve(undefined);
                return;
            }
            resolve(currentTab.url);
        });
    });

    if (!currentUrl) {
        return;
    }

    const basePrUrl = getBaseUrl(currentUrl);

    // Retrieve existing extractedDataByPr from storage
    const { extractedDataByPr = {} } = await chrome.storage.local.get(['extractedDataByPr']) as { extractedDataByPr: ExtractedDataByPr };

    // Remove results for the current PR but keep extractedData
    if (extractedDataByPr[basePrUrl]) {
        delete extractedDataByPr[basePrUrl].results;
    }

    // Save updated data back to storage
    await setInStorage({ extractedDataByPr });

    // Also remove processingComplete flag
    await new Promise<void>((resolve) => {
        chrome.storage.local.remove(['processingComplete'], () => resolve());
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