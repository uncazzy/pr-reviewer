import { setInStorage, getFromStorage } from '@utils/storage';
import { getDetailedFeedback } from '@utils/feedback';
import { displayDetailedFeedback } from './displayDetailedFeedback.ts';
import { getCurrentTabPrUrl } from '@utils/tabs';

interface FileData {
    fileName: string;
    fullContent: string;
}

interface PRData {
    extractedData?: FileData[];
    detailedFeedback?: {
        [fileName: string]: string;
    };
}

interface ExtractedDataByPr {
    [prUrl: string]: PRData;
}

export async function fetchAndDisplayDetailedFeedback(
    fileName: string,
    detailedFeedbackDiv: HTMLDivElement,
    button: HTMLButtonElement
): Promise<void> {
    try {
        

        // Set initial loading state
        detailedFeedbackDiv.style.display = 'block';
        detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading detailed feedback...</div>';

        // Retrieve extractedDataByPr from storage
        const extractedDataByPr: ExtractedDataByPr = await getFromStorage('extractedDataByPr') || {};

        // Get the base PR URL dynamically
        const baseUrl: string | null = await getCurrentTabPrUrl();

        if (!baseUrl) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">PR URL not found. Please ensure you are on a PR page.</p>';
            console.error('Unable to retrieve current PR URL.');
            return;
        }

        const prData: PRData = extractedDataByPr[baseUrl] || {};
        const extractedData: FileData[] = prData.extractedData || [];
        let detailedFeedback: { [fileName: string]: string } = prData.detailedFeedback || {};

        if (!extractedData || extractedData.length === 0) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">No extracted data available. Please re-analyze the PR.</p>';
            console.error('No extractedData found in storage.');
            return;
        }

        const fileData: FileData | undefined = extractedData.find(file => file.fileName === fileName);
        if (!fileData) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            console.error('File data not found for:', fileName);
            return;
        }

        const { fullContent } = fileData;
        const contentLines = fullContent.split('\n');
        
        if (detailedFeedback[fileName]) {
            
            displayDetailedFeedback(fileName, detailedFeedback[fileName], contentLines, detailedFeedbackDiv, button);
        } else {
            const detailedFeedbackResponse: string = await getDetailedFeedback(fileName, baseUrl);
            detailedFeedback[fileName] = detailedFeedbackResponse;

            // Save updated detailedFeedback back to storage
            prData.detailedFeedback = detailedFeedback;
            extractedDataByPr[baseUrl] = prData;
            await setInStorage({ extractedDataByPr });

            displayDetailedFeedback(fileName, detailedFeedbackResponse, contentLines, detailedFeedbackDiv, button);
        }
    } catch (error) {
        console.error('Error fetching or displaying detailed feedback:', error);
        detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to retrieve or generate detailed feedback. Please try again later.</p>';
    }
}