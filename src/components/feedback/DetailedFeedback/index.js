export function createDetailedFeedbackDiv(fileName) {
    const detailedFeedbackDiv = document.createElement('div');
    detailedFeedbackDiv.className = 'detailed-feedback';
    detailedFeedbackDiv.id = `detailed-${CSS.escape(fileName)}`;
    return detailedFeedbackDiv;
}