import { getFromStorage } from './getFromStorage';

interface PrUrlStorage {
  currentPrUrl: string;
}

export async function getPrUrlFromStorage(): Promise<string | undefined> {
  const data = await getFromStorage<PrUrlStorage>('currentPrUrl');
  return data?.currentPrUrl;  // Extract and return the value, not the object
}
