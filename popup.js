const analyzeButton = document.getElementById('analyze');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a valid GitHub PR page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        const isPRPage = /^https:\/\/github\.com\/.*\/pull\/\d+\/files/.test(currentUrl);
        analyzeButton.disabled = !isPRPage;

        if (isPRPage) {
            checkForResults(currentUrl);
        } else {
            resultDiv.innerHTML = '<p>Please navigate to a GitHub pull request page to use this extension.</p>';
        }
    });

    // Initialize syntax highlighting
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    } else {
        console.error('Highlight.js is not loaded');
    }
});

function checkForResults(currentUrl) {
    chrome.storage.local.get(['prResults', 'prUrl'], (data) => {
        if (data.prResults && data.prUrl === currentUrl) {
            displaySavedResults(data.prResults);
        } else {
            console.log('No saved results for this PR.');
        }
    });
}

function displaySavedResults(results) {
    if (!Array.isArray(results) || results.length === 0) {
        console.log('Results are empty or not an array:', results);
        return;
    }
    resultDiv.innerHTML = '';
    results.sort((a, b) => a.index - b.index);
    results.forEach(result => {
        createFileFeedback(result);
    });
}

analyzeButton.addEventListener('click', () => {
    chrome.storage.local.get('openaiApiKey', (data) => {
        if (!data.openaiApiKey) {
            alert('Please set your OpenAI API Key in the extension options.');
            return;
        }

        chrome.storage.local.remove(['prResults', 'processingComplete', 'extractedData'], () => {
            resultDiv.innerHTML = '';
            loadingDiv.style.display = 'block';
            analyzeButton.disabled = true;

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const currentUrl = tabs[0].url;
                chrome.storage.local.set({ 'currentPrUrl': currentUrl }, () => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        files: ['contentScript.js']
                    }, () => {
                        console.log("Content script executed");
                    });
                });
            });
        });
    });
});

chrome.storage.onChanged.addListener((changes, area) => {
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
        }
    }
});

function createFileFeedback(message) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-feedback';

    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = `File: ${message.fileName}`;

    const statusDiv = document.createElement('div');
    statusDiv.className = 'feedback-label';

    const statusIcon = document.createElement('i');
    if (message.status.toLowerCase() === 'requires changes') {
        statusIcon.className = 'fas fa-exclamation-circle';
        statusDiv.classList.add('requires-changes');
    } else {
        statusIcon.className = 'fas fa-check-circle';
        statusDiv.classList.add('looks-good');
    }
    statusDiv.appendChild(statusIcon);
    statusDiv.append(` ${message.status}`);

    const issueDiv = document.createElement('div');
    issueDiv.className = 'feedback-content';
    issueDiv.textContent = message.issue;

    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Expand Feedback';
    expandButton.addEventListener('click', function () {
        expandFeedback(message.fileName, this, detailedFeedbackDiv);
    });

    const detailedFeedbackDiv = document.createElement('div');
    detailedFeedbackDiv.className = 'detailed-feedback';
    detailedFeedbackDiv.id = `detailed-${CSS.escape(message.fileName)}`;

    fileDiv.appendChild(fileName);
    fileDiv.appendChild(statusDiv);
    fileDiv.appendChild(issueDiv);
    fileDiv.appendChild(expandButton);
    fileDiv.appendChild(detailedFeedbackDiv);

    resultDiv.appendChild(fileDiv);
}

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
    // Remove the maxHeight setting
    button.textContent = 'Collapse Feedback';

    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    refreshButton.addEventListener('click', () => refreshDetailedFeedback(detailedFeedbackDiv.id.replace('detailed-', ''), detailedFeedbackDiv, button));
    detailedFeedbackDiv.insertBefore(refreshButton, detailedFeedbackDiv.firstChild);
}

function collapseDetailedFeedback(detailedFeedbackDiv, button) {
    // Remove the maxHeight setting
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

        // Remove existing detailed feedback if it exists
        if (data.detailedFeedback) {
            delete data.detailedFeedback[fileName];
            chrome.storage.local.set({ detailedFeedback: data.detailedFeedback }, () => {
                console.log('Removed existing detailed feedback for:', fileName);
            });
        }

        // Fetch new detailed feedback
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