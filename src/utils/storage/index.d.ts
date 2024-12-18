export function handleStorageChanges(changes: { [key: string]: chrome.storage.StorageChange }, areaName: string): void;
export function getFromStorage<T>(key: string): Promise<T>;
export function setInStorage(key: string, value: any): Promise<void>;
export function removeFromStorage(key: string): Promise<void>;
export function getApiKey(): Promise<string | undefined>;
export function getModel(): Promise<string>;
export function getPrUrlFromStorage(): Promise<string | undefined>;
