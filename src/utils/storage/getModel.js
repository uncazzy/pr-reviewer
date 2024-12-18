import { getFromStorage } from './getFromStorage.js';

export async function getModel() {
  const { openaiModel = 'gpt-4o-mini' } = await getFromStorage('openaiModel');
  return openaiModel;
}