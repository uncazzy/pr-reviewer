import { getApiKey, getModel } from '../storage/index.js';

export async function fetchDetailedFeedbackFromOpenAI(systemPrompt, userPrompt) {
    try {
        const apiKey = await getApiKey();
        const model = await getModel();
        if (!apiKey) throw new Error('OpenAI API key not found.');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 1000,
                temperature: 0.2,
            }),
        });

        const data = await response.json();
        if (data.error) throw new Error(`OpenAI API Error: ${data.error.message}`);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching detailed feedback from OpenAI:', error);
        throw new Error('Failed to fetch detailed feedback from OpenAI.');
    }
}
