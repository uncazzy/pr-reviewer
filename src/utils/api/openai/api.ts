import { getApiKey, getModel } from '@utils/storage';
import { retryWithBackoff } from '../retryWithBackoff.ts';
import { createSystemPrompt, createReviewPrompt } from './prompts/reviewPrompt';

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    error?: {
        message: string;
    };
}

interface OpenAIRequestBody {
    model: string;
    messages: OpenAIMessage[];
    max_tokens: number;
    temperature: number;
}

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
    console.log(`Analyzing file: ${fileName}`);

    const systemPrompt = createSystemPrompt(fileName, fullContent);
    const userPrompt = createReviewPrompt(fileName, fullContent);

    console.log("System Prompt being sent to OpenAI:", systemPrompt);
    console.log('User Prompt being sent to OpenAI:', userPrompt);

    const apiCall = async (): Promise<string> => {
        const apiKey = await getApiKey();
        const model = await getModel();

        if (!apiKey) {
            throw new Error('OpenAI API key not found');
        }

        const requestBody: OpenAIRequestBody = {
            model,
            messages: [
                { role: 'system', content: userPrompt },
                { role: 'user', content: systemPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.2
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        const data: OpenAIResponse = await response.json();

        if (data.error) {
            throw new Error(`OpenAI API Error: ${data.error.message}`);
        }

        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from OpenAI API');
        }

        return data.choices[0].message.content;
    };

    return retryWithBackoff(apiCall);
}
