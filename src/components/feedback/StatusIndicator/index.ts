type StatusType = 'requires changes' | 'warning' | 'looks good' | string;

/**
 * Creates a status indicator div with an appropriate icon
 * @param status - The status to display ('requires changes', 'warning', 'looks good', or custom)
 * @returns An HTMLDivElement containing the status indicator
 */
export function createStatusDiv(status: StatusType): HTMLDivElement {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'feedback-label';

    const statusIcon = document.createElement('i');
    switch (status.toLowerCase()) {
        case 'requires changes':
            statusIcon.className = 'fas fa-exclamation-circle';
            statusDiv.classList.add('requires-changes');
            break;
        case 'warning':
            statusIcon.className = 'fas fa-exclamation-triangle';
            statusDiv.classList.add('warning');
            break;
        case 'looks good':
            statusIcon.className = 'fas fa-check-circle';
            statusDiv.classList.add('looks-good');
            break;
        default:
            statusIcon.className = 'fas fa-times-circle';
            statusDiv.classList.add('error-status');
            status = "Error analyzing file";
            break;
    }
    statusDiv.appendChild(statusIcon);
    statusDiv.append(` ${status}`);
    return statusDiv;
}
