export function createIssueDiv(issue) {
    const issueDiv = document.createElement('div');
    issueDiv.className = 'feedback-content';
    issueDiv.textContent = issue;
    return issueDiv;
}