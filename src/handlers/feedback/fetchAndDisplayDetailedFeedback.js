
import { setInStorage, getFromStorage } from '@utils/storage';
import { getDetailedFeedback } from '@utils/feedback';
import { displayDetailedFeedback } from './displayDetailedFeedback.js';
import { getCurrentTabPrUrl } from '@utils/tabs';

export async function fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    try {
        console.log(`Fetching and displaying detailed feedback for: ${fileName}`);

        // Set initial loading state
        detailedFeedbackDiv.style.display = 'block';
        detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading detailed feedback...</div>';

        // Retrieve extractedDataByPr from storage
        const extractedDataByPr = await getFromStorage('extractedDataByPr') || {};

        // Get the base PR URL dynamically
        const baseUrl = await getCurrentTabPrUrl();

        if (!baseUrl) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">PR URL not found. Please ensure you are on a PR page.</p>';
            console.error('Unable to retrieve current PR URL.');
            return;
        }

        const prData = extractedDataByPr[baseUrl] || {};
        const extractedData = prData.extractedData || [];
        let detailedFeedback = prData.detailedFeedback || {};

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

        const { fullContent } = fileData;
        if (detailedFeedback[fileName]) {
            console.log(`Using cached detailed feedback for ${fileName}`);
            displayDetailedFeedback(fileName, detailedFeedback[fileName], fullContent, detailedFeedbackDiv, button);
        } else {
            const detailedFeedbackResponse = await getDetailedFeedback(fileName, baseUrl);
            detailedFeedback[fileName] = detailedFeedbackResponse;

            // Save updated detailedFeedback back to storage
            prData.detailedFeedback = detailedFeedback;
            extractedDataByPr[baseUrl] = prData;
            await setInStorage({ extractedDataByPr });

            displayDetailedFeedback(fileName, detailedFeedbackResponse, fullContent, detailedFeedbackDiv, button);
        }
    } catch (error) {
        console.error('Error fetching or displaying detailed feedback:', error);
        detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to retrieve or generate detailed feedback. Please try again later.</p>';
    }
}