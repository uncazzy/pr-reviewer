import { createFileName } from './createFileName.js';
import { createStatusDiv } from './createStatusDiv.js';
import { createIssueDiv } from './createIssueDiv.js';
import { createExpandButton } from './createExpandButton.js';
import { createDetailedFeedbackDiv } from './createDetailedFeedbackDiv.js';

// This function creates the entire feedback UI for a single file
export function createFileFeedback(message, resultDiv) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-feedback';

    const fileName = createFileName(message.fileName);
    const statusDiv = createStatusDiv(message.status);
    const issueDiv = createIssueDiv(message.issue);
    const expandButton = createExpandButton(message.fileName);
    const detailedFeedbackDiv = createDetailedFeedbackDiv(message.fileName);

    // Append each component into the file feedback container
    fileDiv.append(fileName, statusDiv, issueDiv, expandButton, detailedFeedbackDiv);
    resultDiv.appendChild(fileDiv); // Append the complete file feedback component to the resultDiv
}
