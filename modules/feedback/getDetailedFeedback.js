import { getFromStorage, setInStorage } from '../storage/index.js';
import { createSystemPrompt, createDetailedFeedbackPrompt } from '../prompts/detailedFeedbackPrompt.js';
import { fetchDetailedFeedbackFromOpenAI } from './fetchDetailedFeedbackFromOpenAI.js';

export async function getDetailedFeedback(fileName, baseUrl) {
    try {
        const extractedDataByPr = await getFromStorage('extractedDataByPr') || {};

        if (!baseUrl) {
            throw new Error('PR URL not provided.');
        }

        const prData = extractedDataByPr[baseUrl] || {};
        const extractedData = prData.extractedData || [];
        const prResults = prData.results || [];
        let detailedFeedbacks = prData.detailedFeedback || {};

        if (detailedFeedbacks[fileName]) {
            console.log(`Retrieving stored detailed feedback for ${fileName}`);
            return detailedFeedbacks[fileName];
        }

        const fileData = extractedData.find((file) => file.fileName === fileName || file.fileName === fileName.replace(/\\/g, ''));
        const initialFeedback = prResults.find((result) => result.fileName === fileName);

        if (!fileData) throw new Error('File data not found.');

        const systemPrompt = createSystemPrompt(fileName, fileData, initialFeedback);
        const userPrompt = createDetailedFeedbackPrompt(fileName, fileData, initialFeedback);

        const detailedFeedback = await fetchDetailedFeedbackFromOpenAI(systemPrompt, userPrompt);

        detailedFeedbacks[fileName] = detailedFeedback;

        // Save updated detailedFeedback back to storage
        prData.detailedFeedback = detailedFeedbacks;
        extractedDataByPr[baseUrl] = prData;
        await setInStorage({extractedDataByPr});

        return detailedFeedback;
    } catch (error) {
        console.error('Error fetching detailed feedback:', error);
        throw new Error('Failed to get detailed feedback.');
    }
}