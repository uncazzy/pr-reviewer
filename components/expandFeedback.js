import { fetchAndDisplayDetailedFeedback, displayDetailedFeedback, collapseDetailedFeedback } from '../modules/feedback.js';

export function expandFeedback(fileName, button, detailedFeedbackDiv) {
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
                displayDetailedFeedback(fileName, data.detailedFeedback[fileName], oldCode, newCode, fullContent, detailedFeedbackDiv, button);
            } else {
                fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button);
            }
        });
    } else {
        collapseDetailedFeedback(detailedFeedbackDiv, button);
    }
}