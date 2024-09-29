// Function to send extracted data to the background script
export function sendExtractedData(extractedData) {
    // Save extracted data to chrome.storage.local
    chrome.storage.local.set({ extractedData }, () => {
        console.log('Extracted data saved to local storage:', extractedData);
    });

    // Send the extracted data to the background script
    chrome.runtime.sendMessage({ files: extractedData });
}