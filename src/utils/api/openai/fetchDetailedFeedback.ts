import OpenAI from 'openai';
import { getApiKey } from '@utils/storage';
import { getModel, getProvider } from '@utils/storage';

/**
 * Fetches detailed feedback from OpenAI's API
 * @param systemPrompt - The system prompt to guide the AI's response
 * @param userPrompt - The user's specific query or content
 * @returns Promise resolving to the AI's detailed feedback
 * @throws Error if API key is missing or API call fails
 */
export async function fetchDetailedFeedbackFromOpenAI(
    systemPrompt: string,
    userPrompt: string
): Promise<string> {
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
        console.error('Error fetching feedback:', error);
        throw error;
    }
}
