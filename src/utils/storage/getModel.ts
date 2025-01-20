import { getFromStorage } from './getFromStorage';

interface ModelStorage {
  openaiModel?: string;
}

export async function getModel(): Promise<string> {
  const { openaiModel = 'gpt-4o-mini' } = await getFromStorage<ModelStorage>('openaiModel');
  return openaiModel;
}
