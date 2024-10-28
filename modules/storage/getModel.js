import { getFromStorage } from './getFromStorage.js';

export async function getModel() {
  const openaiModel = await getFromStorage('openaiModel').catch(() => ({ openaiModel: 'gpt-4o-mini' }));
  return openaiModel;  // Extract and return the value, not the object
}