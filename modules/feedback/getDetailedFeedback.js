import { getFromStorage, setInStorage } from '../storage/index.js';
import { createDetailedFeedbackPrompt } from '../prompts/detailedFeedbackPrompt.js';
import { fetchDetailedFeedbackFromOpenAI } from './fetchDetailedFeedbackFromOpenAI.js';

export async function getDetailedFeedback(fileName) {
    try {
        const data = await getFromStorage(['extractedData', 'prResults', 'detailedFeedback']);
        const extractedData = data.extractedData || [];
        const prResults = data.prResults || [];
        const detailedFeedbacks = data.detailedFeedback || {};

        if (detailedFeedbacks[fileName]) {
            console.log(`Retrieving stored detailed feedback for ${fileName}`);
            return detailedFeedbacks[fileName];
        }

        const fileData = extractedData.find((file) => file.fileName === fileName || file.fileName === fileName.replace(/\\/g, ''));
        const initialFeedback = prResults.find((result) => result.fileName === fileName);

        if (!fileData) throw new Error('File data not found.');

        const prompt = createDetailedFeedbackPrompt(fileName, fileData, initialFeedback);

        const detailedFeedback = await fetchDetailedFeedbackFromOpenAI(prompt);

        detailedFeedbacks[fileName] = detailedFeedback;
        await setInStorage('detailedFeedback', detailedFeedbacks);
        return detailedFeedback;
    } catch (error) {
        console.error('Error fetching detailed feedback:', error);
        throw new Error('Failed to get detailed feedback.');
    }
}
