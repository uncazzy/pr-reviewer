import { getApiKey, getModel } from '../storage/index.js';
import { retryWithBackoff } from './retryWithBackoff.js';
import { createSystemPrompt, createReviewPrompt } from '../prompts/reviewPrompt.js';

// Function to send a code review request to OpenAI
export async function analyzeCodeWithGPT(fileName, fullContent) {
  console.log(`Analyzing file: ${fileName}`);

  const systemPrompt = createSystemPrompt(fileName, fullContent);
  const userPrompt = createReviewPrompt(fileName, fullContent);

  console.log("System Prompt being sent to OpenAI:", systemPrompt);
  console.log('User Prompt being sent to OpenAI:', userPrompt);

  const apiCall = async () => {
    const apiKey = await getApiKey();
    const model = await getModel();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: userPrompt },
          { role: 'user', content: systemPrompt },
        ],
        max_tokens: 1500,
        temperature: 0,
      }),
    });

    const data = await response.json();

    if (data.error) throw new Error(`OpenAI API Error: ${data.error.message}`);
    return data.choices[0].message.content;
  };

  return retryWithBackoff(apiCall);
}

