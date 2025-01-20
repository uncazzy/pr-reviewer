interface StorageData {
  [key: string]: any;
}

export function setInStorage(data: StorageData): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(`Failed to set data in storage: ${chrome.runtime.lastError.message}`);
      } else {
        resolve();
      }
    });
  });
}
