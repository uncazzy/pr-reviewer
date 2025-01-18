import { createFileName } from '@components/file/FileName';
import { createStatusDiv } from '@components/feedback/StatusIndicator';
import { createIssueDiv } from '@components/feedback/IssueDisplay';
import { createActionButtons } from '@components/common/ActionButtons';
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

    // Create header section
    const fileHeader = document.createElement('div');
    fileHeader.className = 'file-header';

    // Create file info section
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';

    const fileName = createFileName(message.fileName, message.fileURL);
    const statusDiv = createStatusDiv(message.status);
    const issueDiv = createIssueDiv(message.issue);

    // Add file name and status to file info
    fileInfo.append(fileName, statusDiv, issueDiv);
    
    // Create action buttons
    const actionButtons = createActionButtons(message.fileName);

    // Assemble header
    fileHeader.append(fileInfo, actionButtons);

    // Create detailed feedback section
    const detailedFeedbackDiv = createDetailedFeedbackDiv(message.fileName);

    // Assemble all components
    fileDiv.append(fileHeader, detailedFeedbackDiv);
    resultDiv.appendChild(fileDiv);
}
