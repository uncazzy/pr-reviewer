import { createFileName } from '@components/file/FileName';
import { createStatusDiv } from '@components/feedback/StatusIndicator';
import { createIssueDiv } from '@components/feedback/IssueDisplay';
import { createExpandButton } from '@components/common/ExpandButton';
import { createDetailedFeedbackDiv } from '@components/feedback/DetailedFeedback';

export interface FeedbackMessage {
    fileName: string;
    fileURL: string;
    status: string;
    issue: string;
    index: number;
    [key: string]: any;
}

/**
 * Creates the entire feedback UI for a single file
 * @param message - The feedback message containing file details and status
 * @param resultDiv - The container element where the feedback will be appended
 */
export function createFileFeedback(message: FeedbackMessage, resultDiv: HTMLElement): void {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-feedback';

    const fileName = createFileName(message.fileName, message.fileURL);
    const statusDiv = createStatusDiv(message.status);
    const issueDiv = createIssueDiv(message.issue);
    const expandButton = createExpandButton(message.fileName);
    const detailedFeedbackDiv = createDetailedFeedbackDiv(message.fileName);

    // Append each component into the file feedback container
    fileDiv.append(fileName, statusDiv, issueDiv, expandButton, detailedFeedbackDiv);
    resultDiv.appendChild(fileDiv); // Append the complete file feedback component to the resultDiv
}
