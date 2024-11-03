import { displayDetailedFeedback } from "./displayDetailedFeedback.js";
import { getFromStorage, setInStorage } from '../storage/index.js';
import { getDetailedFeedback } from './getDetailedFeedback.js';
import { getCurrentPrUrl } from './getCurrentPrUrl.js';

export async function refreshDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Refreshing detailed feedback...</div>';

    try {
        const extractedDataByPr = await getFromStorage('extractedDataByPr') || {};

        const baseUrl = await getCurrentPrUrl();

        if (!baseUrl) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">PR URL not found. Please ensure you are on a PR page.</p>';
            console.error('Unable to retrieve current PR URL.');
            return;
        }

        const prData = extractedDataByPr[baseUrl] || {};
        const extractedData = prData.extractedData || [];
        let detailedFeedbacks = prData.detailedFeedback || {};

        const matchingFile = extractedData.find(file => file.fileName === fileName || file.fileName === fileName.replace(/\\/g, ''));

        if (!matchingFile) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        // Remove existing detailed feedback
        delete detailedFeedbacks[fileName];

        // Save the updated detailed feedback back to storage
        prData.detailedFeedback = detailedFeedbacks;
        extractedDataByPr[baseUrl] = prData;
        await setInStorage({extractedDataByPr});

        // Fetch new detailed feedback
        const detailedFeedback = await getDetailedFeedback(fileName, baseUrl);
        displayDetailedFeedback(
            fileName,
            detailedFeedback,
            matchingFile.fullContent,
            detailedFeedbackDiv,
            button
        );

        detailedFeedbackDiv.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error refreshing detailed feedback:', error);
        detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to refresh detailed feedback. Please try again later.</p>';
    }
}