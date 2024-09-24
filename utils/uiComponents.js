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

function expandFeedback(fileName, button, detailedFeedbackDiv) {
    if (detailedFeedbackDiv.style.display === 'none' || detailedFeedbackDiv.style.display === '') {
        chrome.storage.local.get(['detailedFeedback', 'extractedData'], (data) => {
            const fileData = data.extractedData && data.extractedData.find(file => file.fileName === fileName);

            if (!fileData) {
                console.warn('File data not found for:', fileName);
                fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button);
                return;
            }

            const { oldCode, newCode, fullContent } = fileData;

            if (data.detailedFeedback && data.detailedFeedback[fileName]) {
                // Pass feedback and additional code information to displayDetailedFeedback
                displayDetailedFeedback(data.detailedFeedback[fileName], oldCode, newCode, fullContent, detailedFeedbackDiv, button);
            } else {
                fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button);
            }
        });
    } else {
        collapseDetailedFeedback(detailedFeedbackDiv, button);
    }
}