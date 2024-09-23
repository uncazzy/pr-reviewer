// Constants
const analyzeButton = document.getElementById('analyze');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePopup);
analyzeButton.addEventListener('click', handleAnalyzeClick);
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
        const isPRPage = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(currentUrl);
        analyzeButton.disabled = !isPRPage;

        if (isPRPage) {
            checkForResults(currentUrl);
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

// Result Handling
function checkForResults(currentUrl) {
    chrome.storage.local.get(['prResults', 'prUrl'], (data) => {
        if (data.prResults && data.prUrl === currentUrl) {
            displaySavedResults(data.prResults);
        } else {
            console.log('No saved results for this PR.');
            resultDiv.style.display = 'none';
        }
    });
}

function displaySavedResults(results) {
    if (!Array.isArray(results) || results.length === 0) {
        console.log('Results are empty or not an array:', results);
        resultDiv.style.display = 'none';
        return;
    }
    resultDiv.innerHTML = '';
    results.sort((a, b) => a.index - b.index);
    results.forEach(result => {
        createFileFeedback(result);
    });
    resultDiv.style.display = 'block';
}

// UI Creation
function createFileFeedback(message) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-feedback';

    const fileName = createFileName(message.fileName);
    const statusDiv = createStatusDiv(message.status);
    const issueDiv = createIssueDiv(message.issue);
    const expandButton = createExpandButton(message.fileName);
    const detailedFeedbackDiv = createDetailedFeedbackDiv(message.fileName);

    fileDiv.append(fileName, statusDiv, issueDiv, expandButton, detailedFeedbackDiv);
    resultDiv.appendChild(fileDiv);
}

function createFileName(fileName) {
    const fileNameDiv = document.createElement('div');
    fileNameDiv.className = 'file-name';
    fileNameDiv.textContent = `File: ${fileName}`;
    return fileNameDiv;
}

function createStatusDiv(status) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'feedback-label';

    const statusIcon = document.createElement('i');
    if (status.toLowerCase() === 'requires changes') {
        statusIcon.className = 'fas fa-exclamation-circle';
        statusDiv.classList.add('requires-changes');
    } else {
        statusIcon.className = 'fas fa-check-circle';
        statusDiv.classList.add('looks-good');
    }
    statusDiv.appendChild(statusIcon);
    statusDiv.append(` ${status}`);
    return statusDiv;
}

function createIssueDiv(issue) {
    const issueDiv = document.createElement('div');
    issueDiv.className = 'feedback-content';
    issueDiv.textContent = issue;
    return issueDiv;
}

function createExpandButton(fileName) {
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Expand Feedback';
    expandButton.addEventListener('click', function () {
        const detailedFeedbackDiv = document.getElementById(`detailed-${CSS.escape(fileName)}`);
        expandFeedback(fileName, this, detailedFeedbackDiv);
    });
    return expandButton;
}

function createDetailedFeedbackDiv(fileName) {
    const detailedFeedbackDiv = document.createElement('div');
    detailedFeedbackDiv.className = 'detailed-feedback';
    detailedFeedbackDiv.id = `detailed-${CSS.escape(fileName)}`;
    return detailedFeedbackDiv;
}

// Event Handlers
function handleAnalyzeClick() {
    chrome.storage.local.get('openaiApiKey', (data) => {
        if (!data.openaiApiKey) {
            alert('Please set your OpenAI API Key in the extension options.');
            return;
        }

        chrome.storage.local.remove(['prResults', 'processingComplete', 'extractedData'], () => {
            resultDiv.innerHTML = '';
            resultDiv.style.display = 'none';
            loadingDiv.style.display = 'block';
            analyzeButton.disabled = true;

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const currentTab = tabs[0];
                let currentUrl = currentTab.url;

                chrome.storage.local.set({ 'currentPrUrl': currentUrl }, () => {
                    // Check if the current URL includes '/files'
                    if (!currentUrl.includes('/files')) {
                        // Replace "commits" or "checks" with "files" in the URL
                        currentUrl = currentUrl.replace('/commits', '/files').replace('/checks', '/files');

                        // If the current URL doesn't end with '/files' or any specific tab, append '/files'
                        const filesUrl = currentUrl.match(/\/pull\/\d+$/) ? `${currentUrl}/files` : currentUrl;

                        // Update the tab with the new URL
                        chrome.tabs.update(currentTab.id, { url: filesUrl }, () => {
                            // Listen for the tab to finish loading
                            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
                                if (tabId === currentTab.id && changeInfo.status === 'complete') {
                                    // Remove the listener to prevent multiple triggers
                                    chrome.tabs.onUpdated.removeListener(listener);
                                    // Execute the content script
                                    chrome.scripting.executeScript({
                                        target: { tabId: tab.id },
                                        files: ['contentScript.js']
                                    }, () => {
                                        console.log("Content script executed on /files tab");
                                    });
                                }
                            });
                        });
                    } else {
                        // Already on the '/files' tab, execute the content script directly
                        chrome.scripting.executeScript({
                            target: { tabId: currentTab.id },
                            files: ['contentScript.js']
                        }, () => {
                            console.log("Content script executed on /files tab");
                        });
                    }
                });
            });
        });
    });
}

function handleStorageChanges(changes, area) {
    if (area === 'local') {
        if (changes.prResults) {
            const results = changes.prResults.newValue;
            displaySavedResults(results);
        }
        if (changes.processingComplete) {
            loadingDiv.style.display = 'none';
            analyzeButton.disabled = false;
        }
        if (changes.error) {
            loadingDiv.style.display = 'none';
            analyzeButton.disabled = false;
            alert(changes.error.newValue);
            chrome.storage.local.remove('error');
            resultDiv.style.display = 'none';
        }
    }
}

// Detailed Feedback
function expandFeedback(fileName, button, detailedFeedbackDiv) {
    if (detailedFeedbackDiv.style.display === 'none' || detailedFeedbackDiv.style.display === '') {
        chrome.storage.local.get(['detailedFeedback'], (data) => {
            if (data.detailedFeedback && data.detailedFeedback[fileName]) {
                displayDetailedFeedback(data.detailedFeedback[fileName], detailedFeedbackDiv, button);
            } else {
                fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button);
            }
        });
    } else {
        collapseDetailedFeedback(detailedFeedbackDiv, button);
    }
}

function fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    detailedFeedbackDiv.style.display = 'block';
    detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading detailed feedback...</div>';

    chrome.storage.local.get('extractedData', (data) => {
        if (!data.extractedData || !data.extractedData.find(file => file.fileName === fileName)) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        chrome.runtime.sendMessage({ action: 'getDetailedFeedback', fileName: fileName }, (response) => {
            if (response && response.detailedFeedback) {
                saveDetailedFeedbackToStorage(fileName, response.detailedFeedback);
                displayDetailedFeedback(response.detailedFeedback, detailedFeedbackDiv, button);
            } else {
                detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to load detailed feedback.</p>';
            }
        });
    });
}

function saveDetailedFeedbackToStorage(fileName, feedback) {
    chrome.storage.local.get(['detailedFeedback'], (data) => {
        const detailedFeedback = data.detailedFeedback || {};
        detailedFeedback[fileName] = feedback;
        chrome.storage.local.set({ detailedFeedback: detailedFeedback }, () => {
            console.log('Detailed feedback saved for:', fileName);
        });
    });
}

function displayDetailedFeedback(feedback, detailedFeedbackDiv, button) {
    const parsedContent = marked.parse(feedback);
    detailedFeedbackDiv.innerHTML = parsedContent;
    detailedFeedbackDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    detailedFeedbackDiv.style.display = 'block';
    button.textContent = 'Collapse Feedback';

    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    refreshButton.addEventListener('click', () => refreshDetailedFeedback(detailedFeedbackDiv.id.replace('detailed-', ''), detailedFeedbackDiv, button));
    detailedFeedbackDiv.insertBefore(refreshButton, detailedFeedbackDiv.firstChild);
}

function collapseDetailedFeedback(detailedFeedbackDiv, button) {
    detailedFeedbackDiv.style.display = 'none';
    button.textContent = 'Expand Feedback';
}

function refreshDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Refreshing detailed feedback...</div>';

    chrome.storage.local.get(['detailedFeedback', 'extractedData'], (data) => {
        console.log("Full data from storage:", data);
        console.log("Searching for fileName:", fileName);

        if (!data.extractedData || !Array.isArray(data.extractedData)) {
            console.log("extractedData is not an array or is undefined:", data.extractedData);
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        console.log("extractedData array:", data.extractedData);

        const matchingFile = data.extractedData.find(file => {
            console.log("Comparing:", file.fileName, "with", fileName);
            console.log("Stripped comparison:", file.fileName, "with", fileName.replace(/\\/g, ''));
            return file.fileName === fileName || file.fileName === fileName.replace(/\\/g, '');
        });

        if (!matchingFile) {
            console.log("No matching file found");
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        console.log("Matching file found:", matchingFile);

        if (data.detailedFeedback) {
            delete data.detailedFeedback[fileName];
            chrome.storage.local.set({ detailedFeedback: data.detailedFeedback }, () => {
                console.log('Removed existing detailed feedback for:', fileName);
            });
        }

        chrome.runtime.sendMessage({ action: 'getDetailedFeedback', fileName: fileName }, (response) => {
            if (response && response.detailedFeedback) {
                saveDetailedFeedbackToStorage(fileName, response.detailedFeedback);
                displayDetailedFeedback(response.detailedFeedback, detailedFeedbackDiv, button);
            } else {
                detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to load detailed feedback.</p>';
            }
        });
    });
}


function toggleAboutSection() {
    chrome.runtime.openOptionsPage();  // Redirects to the options page
}