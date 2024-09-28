import { getFromStorage } from './getFromStorage.js';

export async function getModel() {
  const data = await getFromStorage('openaiModel').catch(() => ({ openaiModel: 'gpt-4o-mini' }));
  return data.openaiModel;  // Extract and return the value, not the object
}