function fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    detailedFeedbackDiv.style.display = 'block';
    detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading detailed feedback...</div>';

    chrome.storage.local.get('extractedData', (data) => {
        const fileData = data.extractedData && data.extractedData.find(file => file.fileName === fileName);

        if (!fileData) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        const { oldCode, newCode, fullContent } = fileData;

        chrome.runtime.sendMessage({ action: 'getDetailedFeedback', fileName: fileName }, (response) => {
            if (response && response.detailedFeedback) {
                saveDetailedFeedbackToStorage(fileName, response.detailedFeedback);
                displayDetailedFeedback(response.detailedFeedback, oldCode, newCode, fullContent, detailedFeedbackDiv, button);
            } else {
                detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to load detailed feedback.</p>';
            }
        });
    });
}

function displayDetailedFeedback(fileName, feedback, oldCode, newCode, fullContent, detailedFeedbackDiv, button) {
    const parsedContent = marked.parse(feedback);
    detailedFeedbackDiv.innerHTML = parsedContent;
    detailedFeedbackDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    detailedFeedbackDiv.style.display = 'block';
    button.textContent = 'Collapse Feedback';

    // Create a container for both the buttons (Refresh and Ask Follow-up)
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    refreshButton.addEventListener('click', () => refreshDetailedFeedback(detailedFeedbackDiv.id.replace('detailed-', ''), detailedFeedbackDiv, button));
    buttonContainer.appendChild(refreshButton);

    // "Ask Follow-up" button with icon
    const askFollowUpButton = document.createElement('button');
    askFollowUpButton.className = 'follow-up-button';
    askFollowUpButton.innerHTML = '<i class="fas fa-comments"></i> Ask Follow-up';
    askFollowUpButton.addEventListener('click', () => {
        openChatWithFeedback(fileName, feedback, fullContent, newCode, oldCode);  // Pass all code data to chat
    });
    buttonContainer.appendChild(askFollowUpButton);

    // Append button container below the detailed feedback
    detailedFeedbackDiv.appendChild(buttonContainer);
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