import { getFromStorage } from './getFromStorage';

export async function getApiKey(): Promise<string | undefined> {
  const openaiApiKey = await getFromStorage<string>('openaiApiKey');
  return openaiApiKey;
}
