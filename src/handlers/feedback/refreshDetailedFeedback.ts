import { displayDetailedFeedback } from "./displayDetailedFeedback";
import { getFromStorage, setInStorage } from '@utils/storage';
import { getDetailedFeedback } from '@utils/feedback';
import { getCurrentTabPrUrl } from '@utils/tabs';

interface ExtractedFile {
    fileName: string;
    fullContent: string[];
}

interface DetailedFeedbacks {
    [fileName: string]: string;
}

interface PrData {
    extractedData?: ExtractedFile[];
    detailedFeedback?: DetailedFeedbacks;
}

interface ExtractedDataByPr {
    [baseUrl: string]: PrData;
}

/**
 * Refreshes the detailed feedback for a specific file
 * @param fileName - The name of the file to refresh feedback for
 * @param detailedFeedbackDiv - The div element to display the feedback in
 * @param button - The button that triggered the refresh
 */
export async function refreshDetailedFeedback(
    fileName: string,
    detailedFeedbackDiv: HTMLElement,
    button: HTMLButtonElement
): Promise<void> {
    detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Refreshing detailed feedback...</div>';

    try {
        const extractedDataByPr = (await getFromStorage('extractedDataByPr')) as ExtractedDataByPr || {};

        const baseUrl = await getCurrentTabPrUrl();

        if (!baseUrl) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">PR URL not found. Please ensure you are on a PR page.</p>';
            console.error('Unable to retrieve current PR URL.');
            return;
        }

        const prData = extractedDataByPr[baseUrl] || {};
        const extractedData = prData.extractedData || [];
        let detailedFeedbacks = prData.detailedFeedback || {};

        const matchingFile = extractedData.find(file => 
            file.fileName === fileName || file.fileName === fileName.replace(/\\/g, '')
        );

        if (!matchingFile) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        // Remove existing detailed feedback
        delete detailedFeedbacks[fileName];

        // Save the updated detailed feedback back to storage
        prData.detailedFeedback = detailedFeedbacks;
        extractedDataByPr[baseUrl] = prData;
        await setInStorage({ extractedDataByPr });

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
