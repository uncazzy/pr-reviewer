const analyzeButton = document.getElementById('analyze');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');

// When the popup is opened, check for saved results
document.addEventListener('DOMContentLoaded', () => {
     // Check if hljs is loaded before using it
     if (typeof hljs !== 'undefined') {
        // Register the languages
        hljs.registerLanguage('javascript', window.hljsDefineJavaScript);
        hljs.registerLanguage('css', window.hljsDefineCSS);
        hljs.registerLanguage('python', window.hljsDefinePython);

        // Initialize syntax highlighting
        hljs.highlightAll();
    } else {
        console.error('Highlight.js is not loaded');
    }
    checkForResults();
    chrome.storage.local.get('error', (data) => {
        if (data.error) {
            alert(data.error);
            chrome.storage.local.remove('error');
        }
    });
});

function checkForResults() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        chrome.storage.local.get(['prResults', 'prUrl'], (data) => {
            if (data.prResults && data.prUrl === currentUrl) {
                displaySavedResults(data.prResults);
            } else {
                console.log('No saved results for this PR.');
            }
        });
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

// When the "Analyze PR Code" button is clicked
analyzeButton.addEventListener('click', () => {
    // Check if API key is set
    chrome.storage.local.get('openaiApiKey', (data) => {
        if (!data.openaiApiKey) {
            alert('Please set your OpenAI API Key in the extension options.');
            return;
        }

        // Clear previous results and extracted data
        chrome.storage.local.remove(['prResults', 'processingComplete', 'extractedData'], () => {
            // Clear previous results and show loading
            resultDiv.innerHTML = '';
            loadingDiv.style.display = 'block';
            analyzeButton.disabled = true; // Disable the button to prevent multiple clicks

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const currentUrl = tabs[0].url;
                chrome.storage.local.set({ 'currentPrUrl': currentUrl }, () => {
                    // Execute content script
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

// Listen for storage changes to update UI
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

    // File name section
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = `File: ${message.fileName}`;

    // Status section with icon
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

    // Issue section
    const issueDiv = document.createElement('div');
    issueDiv.className = 'feedback-content';
    issueDiv.textContent = message.issue;

    // Expand Feedback button
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Expand Feedback';
    expandButton.addEventListener('click', function() {
        expandFeedback(message.fileName, this);
    });

    // Detailed Feedback section
    const detailedFeedbackDiv = document.createElement('div');
    detailedFeedbackDiv.className = 'detailed-feedback';
    detailedFeedbackDiv.id = `detailed-${CSS.escape(message.fileName)}`;

    fileDiv.appendChild(fileName);
    fileDiv.appendChild(statusDiv);
    fileDiv.appendChild(issueDiv);
    fileDiv.appendChild(expandButton);
    fileDiv.appendChild(detailedFeedbackDiv);

    // Append the file div to the result div
    resultDiv.appendChild(fileDiv);
}

function expandFeedback(fileName, button) {
    const detailedFeedbackDiv = document.getElementById(`detailed-${CSS.escape(fileName)}`);
    if (detailedFeedbackDiv.style.display === 'none' || detailedFeedbackDiv.style.display === '') {
        detailedFeedbackDiv.style.display = 'block';
        detailedFeedbackDiv.style.maxHeight = '0';
        detailedFeedbackDiv.style.overflow = 'hidden';
        detailedFeedbackDiv.style.transition = 'max-height 0.5s ease';

        // Request detailed feedback from background.js
        chrome.runtime.sendMessage({ action: 'getDetailedFeedback', fileName: fileName }, (response) => {
            if (response && response.detailedFeedback) {
                // Use marked.js to parse the markdown
                const parsedContent = marked.parse(response.detailedFeedback);

                // Apply syntax highlighting to code blocks
                detailedFeedbackDiv.innerHTML = parsedContent;

                // Highlight code blocks
                detailedFeedbackDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });

                // Expand the detailed feedback
                detailedFeedbackDiv.style.maxHeight = detailedFeedbackDiv.scrollHeight + 'px';
            } else {
                detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to load detailed feedback.</p>';
            }
        });

        // Change button text
        button.textContent = 'Collapse Feedback';
    } else {
        // Collapse the detailed feedback
        detailedFeedbackDiv.style.maxHeight = '0';

        // After transition, hide the element
        setTimeout(() => {
            detailedFeedbackDiv.style.display = 'none';
        }, 500);

        // Change button text
        button.textContent = 'Expand Feedback';
    }
}
