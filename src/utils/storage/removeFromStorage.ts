export function removeFromStorage(key: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(`Failed to remove ${key} from storage: ${chrome.runtime.lastError.message}`);
      } else {
        resolve();
      }
    });
  });
}
