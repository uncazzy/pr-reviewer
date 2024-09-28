import { getFromStorage } from './getFromStorage.js';

export async function getApiKey() {
  const data = await getFromStorage('openaiApiKey');
  return data.openaiApiKey;  // Extract and return the value, not the object
}