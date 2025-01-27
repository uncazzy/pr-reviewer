import OpenAI from 'openai';
import { getApiKey, getModel, getProvider } from '@utils/storage';
import { retryWithBackoff } from '../retryWithBackoff.ts';
import { createSystemPrompt, createReviewPrompt } from './prompts/reviewPrompt';

/**
 * Sends a code review request to OpenAI's API
 * @param fileName - Name of the file being reviewed
 * @param fullContent - Content of the file being reviewed
 * @returns Promise resolving to the AI's review response
 * @throws Error if the API call fails
 */
export async function analyzeCodeWithGPT(
    fileName: string,
    fullContent: string
): Promise<string> {

    const systemPrompt = createSystemPrompt(fileName, fullContent);
    const userPrompt = createReviewPrompt(fileName, fullContent);

    const apiCall = async (): Promise<string> => {
        try {
            const apiKey = await getApiKey();
            const model = await getModel();
            const provider = await getProvider();

            if (!apiKey) {
                throw new Error(`${provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API key not found.`);
            }

            const openai = new OpenAI({
                apiKey,
                baseURL: provider === 'deepseek' ? 'https://api.deepseek.com' : undefined,
                dangerouslyAllowBrowser: true
            });

            const response = await openai.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ]
            });

            if (!response.choices?.[0]?.message?.content) {
                throw new Error('No response content received from the API');
            }

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Error analyzing code:', error);
            throw error;
        }
    };

    return retryWithBackoff(apiCall);
}
