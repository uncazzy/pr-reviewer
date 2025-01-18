/**
 * Creates a div element to display an issue or feedback message
 * @param issue - The issue or feedback message to display
 * @returns An HTMLDivElement containing the issue message
 */
export function createIssueDiv(issue: string): HTMLDivElement {
    const issueDiv = document.createElement('div');
    issueDiv.className = 'issue-text';
    issueDiv.textContent = issue || 'No issues detected';
    return issueDiv;
}
