import { getFromStorage } from './getFromStorage';

interface ModelStorage {
  openaiModel?: string;
}

export async function getModel(): Promise<string> {
  const result = await getFromStorage<ModelStorage>('openaiModel');
  const model = typeof result === 'string' ? result : result?.openaiModel ?? 'gpt-4o-mini';
  return model;
}
