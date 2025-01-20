import { getApiKey, getModel } from '@utils/storage';

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenAIRequestBody {
    model: string;
    messages: OpenAIMessage[];
    max_tokens: number;
    temperature: number;
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
        
        if (!apiKey) {
            throw new Error('OpenAI API key not found.');
        }

        const requestBody: OpenAIRequestBody = {
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
            ],
            max_tokens: 1000,
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
    } catch (error) {
        console.error('Error fetching detailed feedback from OpenAI:', error);
        if (error instanceof Error) {
            throw error; // Re-throw original error if it's an Error instance
        }
        throw new Error('Failed to fetch detailed feedback from OpenAI.');
    }
}
