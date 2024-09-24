function checkForResults(currentUrl) {
    // Extract the base part of the URL up to the PR number (e.g., /pull/3)
    const baseUrl = currentUrl.split('/pull/')[0] + "/pull/" + currentUrl.split('/pull/')[1].split('/')[0];
    chrome.storage.local.get(['prResults', 'prUrl'], (data) => {
        // Check if prUrl exists before splitting it
        if (data.prUrl) {
            // Extract base URL from saved prUrl to compare
            const savedBaseUrl = data.prUrl.split('/pull/')[0] + "/pull/" + data.prUrl.split('/pull/')[1].split('/')[0];
            // Compare the base parts of the URLs
            if (data.prResults && baseUrl === savedBaseUrl) {
                displaySavedResults(data.prResults);
            } else {
                console.log('No saved results for this PR.');
                resultDiv.style.display = 'none';
            }
        } else {
            console.log('No saved prUrl found.');
            resultDiv.style.display = 'none';
        }
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

// Function to retrieve API key from storage
function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('openaiApiKey', (data) => {
            if (data.openaiApiKey) {
                resolve(data.openaiApiKey);
            } else {
                reject('OpenAI API key not found.');
            }
        });
    });
}

// Function to retrieve OpenAI model from storage
function getModel() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('openaiModel', (data) => {
            if (data.openaiModel) {
                resolve(data.openaiModel);
            } else {
                resolve('gpt-4o-mini')
            }
        });
    });
}