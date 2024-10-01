import { handleAnalyzeClick } from './modules/handlers/analyzeClick/index.js';
import { handleStorageChanges, getFromStorage, setInStorage } from './modules/storage/index.js';
import { checkForResults } from "./modules/result/index.js";
import { createFilePicker } from './modules/components/createFilePicker.js';
import { executeContentScript } from './modules/handlers/analyzeClick/executeContentScript.js';

const analyzeButton = document.getElementById('analyze');
const reanalyzeButton = document.getElementById('reanalyze');
const settingsButton = document.getElementById('settings-button');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const filePickerDiv = document.getElementById('file-picker');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePopup);
analyzeButton.addEventListener('click', async () => {
    await handleAnalyzeClick(loadingDiv, analyzeButton, resultDiv, filePickerDiv);
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
    const hasResults = await checkGitHubPRPage();
    if (hasResults) {
        analyzeButton.style.display = 'none';
        reanalyzeButton.style.display = 'inline-block';
    } else {
        analyzeButton.style.display = 'inline-block';
        reanalyzeButton.style.display = 'none';
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

                // Check if results already exist
                const hasResults = await checkForResults(currentUrl, resultDiv);
                if (!hasResults) {
                    // Execute content script to extract files
                    await executeContentScript(currentTab.id);
                    // Wait for extractedData to be available
                    await waitForExtractedData();

                    // Show the file picker
                    const { extractedData } = await getFromStorage('extractedData');
                    if (extractedData && extractedData.length > 0) {
                        createFilePicker(filePickerDiv);
                        filePickerDiv.style.display = 'block';
                    } else {
                        filePickerDiv.style.display = 'none';
                    }
                } else {
                    filePickerDiv.style.display = 'none';
                }
                resolve(hasResults);
            } else {
                resultDiv.innerHTML = '<p>Please navigate to a GitHub pull request page to use this extension.</p>';
                filePickerDiv.style.display = 'none';
                resolve(false);
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

async function resetUI() {
    // Get the current PR URL
    const currentUrl = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0].url);
        });
    });

    // Retrieve existing allPrResults from storage
    const { allPrResults = {} } = await chrome.storage.local.get('allPrResults');

    // Remove results for the current PR
    delete allPrResults[currentUrl];

    // Save updated allPrResults to storage
    await setInStorage('allPrResults', allPrResults);

    // Also remove processingComplete flag
    await new Promise((resolve) => {
        chrome.storage.local.remove(['processingComplete'], resolve);
    });

    // Reset UI elements
    resultDiv.innerHTML = '';
    resultDiv.style.display = 'none';
    filePickerDiv.innerHTML = '';
    filePickerDiv.style.display = 'none';
    analyzeButton.disabled = false;
    analyzeButton.style.display = 'inline-block';
    reanalyzeButton.style.display = 'none';
}