import { getFromStorage } from './getFromStorage.js';

export async function getApiKey() {
  const openaiApiKey = await getFromStorage('openaiApiKey');
  return openaiApiKey;  // Extract and return the value, not the object
}