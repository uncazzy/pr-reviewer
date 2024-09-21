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
        hljs.registerLanguage('javascript', window.hljsDefineJavaScript);
        hljs.registerLanguage('css', window.hljsDefineCSS);
        hljs.registerLanguage('python', window.hljsDefinePython);
        hljs.highlightAll();
    } else {
        console.error('Highlight.js is not loaded');
    }

    // Add event listener for the clear storage button
    const clearStorageButton = document.getElementById('clearStorage');
    clearStorageButton.addEventListener('click', clearStorage);
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
    expandButton.addEventListener('click', function() {
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
                detailedFeedbackDiv.style.display = 'block';
                detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading detailed feedback...</div>';

                chrome.runtime.sendMessage({ action: 'getDetailedFeedback', fileName: fileName }, (response) => {
                    if (response && response.detailedFeedback) {
                        chrome.storage.local.get(['detailedFeedback'], (data) => {
                            const detailedFeedback = data.detailedFeedback || {};
                            detailedFeedback[fileName] = response.detailedFeedback;
                            chrome.storage.local.set({ detailedFeedback: detailedFeedback }, () => {
                                console.log('Detailed feedback saved for:', fileName);
                            });
                        });

                        displayDetailedFeedback(response.detailedFeedback, detailedFeedbackDiv, button);
                    } else {
                        detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to load detailed feedback.</p>';
                    }
                });
            }
        });
    } else {
        detailedFeedbackDiv.style.maxHeight = '0';
        setTimeout(() => {
            detailedFeedbackDiv.style.display = 'none';
        }, 500);
        button.textContent = 'Expand Feedback';
    }
}

function displayDetailedFeedback(feedback, detailedFeedbackDiv, button) {
    const parsedContent = marked.parse(feedback);
    detailedFeedbackDiv.innerHTML = parsedContent;
    detailedFeedbackDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    detailedFeedbackDiv.style.maxHeight = detailedFeedbackDiv.scrollHeight + 'px';
    button.textContent = 'Collapse Feedback';
}

// Function to clear storage
function clearStorage() {
    chrome.storage.local.clear(() => {
        console.log('Storage cleared');
        resultDiv.innerHTML = '<p>Storage cleared. Refresh the page to see the changes.</p>';
        alert('Storage cleared. Please refresh the page to see the changes.');
    });
}
