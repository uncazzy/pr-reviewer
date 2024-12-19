import { getFromStorage, setInStorage } from '@utils/storage';
import { createSystemPrompt, createDetailedFeedbackPrompt } from '@utils/api/openai/prompts/detailedFeedbackPrompt';
import { fetchDetailedFeedbackFromOpenAI } from '@utils/api/openai/fetchDetailedFeedbackFromOpenAI';

/**
 * Data structure for extracted data
 */
interface ExtractedData {
    fileName: string;
    fullContent: string;
    [key: string]: unknown;
}

/**
 * Data structure for feedback results
 */
interface FeedbackResult {
    fileName: string;
    status: string;
    issue: string;
    [key: string]: unknown;
}

/**
 * Data structure for initial feedback
 */
interface InitialFeedback {
    status?: string;
    issue?: string;
}

/**
 * Data structure for detailed feedbacks
 */
interface DetailedFeedbacks {
    [fileName: string]: string;
}

/**
 * Data structure for PR data
 */
interface PRData {
    extractedData?: ExtractedData[];
    results?: FeedbackResult[];
    detailedFeedback?: DetailedFeedbacks;
}

/**
 * Data structure for extracted data by PR
 */
interface ExtractedDataByPr {
    [baseUrl: string]: PRData;
}

/**
 * Converts a FeedbackResult to InitialFeedback format
 * @param feedback - The feedback result to convert
 * @returns InitialFeedback object or null if input is undefined
 */
function convertToInitialFeedback(feedback: FeedbackResult | undefined): InitialFeedback | null {
    if (!feedback) {
        return null;
    }
    return {
        status: feedback.status,
        issue: feedback.issue
    };
}

/**
 * Retrieves or generates detailed feedback for a specific file
 * @param fileName - Name of the file to get feedback for
 * @param baseUrl - Base URL of the pull request
 * @returns Promise resolving to the detailed feedback
 * @throws Error if file data is not found or feedback generation fails
 */
export async function getDetailedFeedback(
    fileName: string,
    baseUrl: string
): Promise<string> {
    try {
        // Get extracted data from storage
        const extractedDataByPr: ExtractedDataByPr = await getFromStorage('extractedDataByPr') || {};

        // Check if base URL is provided
        if (!baseUrl) {
            throw new Error('PR URL not provided.');
        }

        // Get PR data for the given base URL
        const prData: PRData = extractedDataByPr[baseUrl] || {};
        const extractedData: ExtractedData[] = prData.extractedData || [];
        const prResults: FeedbackResult[] = prData.results || [];
        const detailedFeedbacks: DetailedFeedbacks = prData.detailedFeedback || {};

        // Check if we already have feedback for this file
        if (detailedFeedbacks[fileName]) {
            console.log(`Retrieving stored detailed feedback for ${fileName}`);
            return detailedFeedbacks[fileName];
        }

        // Find file data and initial feedback
        const fileData = extractedData.find(
            (file) => file.fileName === fileName || file.fileName === fileName.replace(/\\/g, '')
        );
        const initialFeedback = convertToInitialFeedback(
            prResults.find((result) => result.fileName === fileName)
        );

        // Check if file data is found
        if (!fileData) {
            throw new Error('File data not found.');
        }

        // Generate prompts and get feedback
        const systemPrompt = createSystemPrompt(fileName, fileData, initialFeedback);
        const userPrompt = createDetailedFeedbackPrompt(fileName, fileData, initialFeedback);

        const detailedFeedback = await fetchDetailedFeedbackFromOpenAI(systemPrompt, userPrompt);

        // Update storage with new feedback
        detailedFeedbacks[fileName] = detailedFeedback;
        prData.detailedFeedback = detailedFeedbacks;
        extractedDataByPr[baseUrl] = prData;
        
        await setInStorage({ extractedDataByPr });

        return detailedFeedback;
    } catch (error) {
        console.error('Error fetching detailed feedback:', error);
        if (error instanceof Error) {
            throw error; // Re-throw original error if it's an Error instance
        }
        throw new Error('Failed to get detailed feedback.');
    }
}