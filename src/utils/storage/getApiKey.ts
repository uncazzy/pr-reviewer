import { getFromStorage } from '.';
import { getProvider } from './getModel';

export async function getApiKey(): Promise<string | undefined> {
    const provider = await getProvider();
    const key = await getFromStorage<string>(provider === 'deepseek' ? 'deepseekApiKey' : 'openaiApiKey');
    
    if (!key) {
        throw new Error(`${provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API key is required for the selected model.`);
    }
    
    return key;
}
