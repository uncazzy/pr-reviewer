export function createStatusDiv(status) {
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
