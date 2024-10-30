export async function deleteAllPrData() {
    const prDataKeys = [
        'extractedDataByPr',
        'prOrder',
        'prResults',
        'processingComplete',
        'extractedData',
        'chatHistory',
        'apiMessagesHistory',
    ];

    return new Promise((resolve, reject) => {
        chrome.storage.local.remove(prDataKeys, () => {
            if (chrome.runtime.lastError) {
                reject(`Failed to remove PR data: ${chrome.runtime.lastError.message}`);
            } else {
                resolve();
            }
        });
    });
}