/**
 * Creates a div element for displaying detailed feedback for a file
 * @param fileName - The name of the file to create detailed feedback for
 * @returns An HTMLDivElement configured for detailed feedback display
 */
export function createDetailedFeedbackDiv(fileName: string): HTMLDivElement {
    const detailedFeedbackDiv = document.createElement('div');
    detailedFeedbackDiv.className = 'detailed-feedback';
    detailedFeedbackDiv.id = `detailed-${CSS.escape(fileName)}`;
    return detailedFeedbackDiv;
}
