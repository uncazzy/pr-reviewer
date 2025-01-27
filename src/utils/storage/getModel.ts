import { getFromStorage } from './getFromStorage';

export function getProviderFromModel(model: string): 'openai' | 'deepseek' {
    return model.startsWith('deepseek-') ? 'deepseek' : 'openai';
}

export async function getModel(): Promise<string> {
    const result = await getFromStorage<string>('selectedModel');
    console.log("result", result)
    return result ?? 'gpt-4o-mini';
}

export async function getProvider(): Promise<'openai' | 'deepseek'> {
    const model = await getModel();
    return getProviderFromModel(model);
}
