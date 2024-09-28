
import { handleStorageChanges } from './modules/storage/index.js';
import { handleAnalyzeClick } from "./handlers/analyzeClickHandler.js"
import { checkForResults } from "./modules/result/result.js"

const analyzeButton = document.getElementById('analyze');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePopup);
analyzeButton.addEventListener('click', () => handleAnalyzeClick(loadingDiv, analyzeButton, resultDiv));
chrome.storage.onChanged.addListener(handleStorageChanges);

const settingsButton = document.getElementById('settings-button');
settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();  // Opens the options page
});

// Initialization
function initializePopup() {
    checkGitHubPRPage();
    initializeSyntaxHighlighting();
}

function checkGitHubPRPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        const isPRPage = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+(\/(commits|checks|files))?$/.test(currentUrl);
        analyzeButton.disabled = !isPRPage;

        if (isPRPage) {
            checkForResults(currentUrl, resultDiv);
        } else {
            resultDiv.innerHTML = '<p>Please navigate to a GitHub pull request page to use this extension.</p>';
        }
    });
}

function initializeSyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    } else {
        console.error('Highlight.js is not loaded');
    }
}
