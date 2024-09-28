import { getFromStorage } from './getFromStorage.js';

export async function getCurrentPrUrl() {
  const data = await getFromStorage('currentPrUrl');
  return data.currentPrUrl;  // Extract and return the value, not the object
}