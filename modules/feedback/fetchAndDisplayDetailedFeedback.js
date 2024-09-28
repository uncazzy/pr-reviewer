import { getDetailedFeedback } from './getDetailedFeedback.js';
import { setInStorage, getFromStorage } from '../storage/index.js';
import { displayDetailedFeedback } from './displayDetailedFeedback.js';

export async function fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    try {
        console.log(`Fetching and displaying detailed feedback for: ${fileName}`);

        // Set initial loading state
        detailedFeedbackDiv.style.display = 'block';
        detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading detailed feedback...</div>';

        // Retrieve extractedData and detailedFeedback from storage
        const storageData = await getFromStorage(['extractedData', 'detailedFeedback']);
        const extractedData = storageData.extractedData || [];
        let detailedFeedback = storageData.detailedFeedback || {};

        if (!extractedData || extractedData.length === 0) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">No extracted data available. Please re-analyze the PR.</p>';
            console.error('No extractedData found in storage.');
            return;
        }

        const fileData = extractedData.find(file => file.fileName === fileName);
        if (!fileData) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            console.error('File data not found for:', fileName);
            return;
        }

        const { oldCode, newCode, fullContent } = fileData;
        if (detailedFeedback[fileName]) {
            console.log(`Using cached detailed feedback for ${fileName}`);
            displayDetailedFeedback(fileName, detailedFeedback[fileName], oldCode, newCode, fullContent, detailedFeedbackDiv, button);
        } else {
            const detailedFeedbackResponse = await getDetailedFeedback(fileName);
            detailedFeedback[fileName] = detailedFeedbackResponse;
            await setInStorage('detailedFeedback', detailedFeedback);
            displayDetailedFeedback(fileName, detailedFeedbackResponse, oldCode, newCode, fullContent, detailedFeedbackDiv, button);
        }
    } catch (error) {
        console.error('Error fetching or displaying detailed feedback:', error);
        detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to retrieve or generate detailed feedback. Please try again later.</p>';
    }
}
