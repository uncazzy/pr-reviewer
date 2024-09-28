import { displayDetailedFeedback } from "./displayDetailedFeedback.js"

export function refreshDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Refreshing detailed feedback...</div>';

    chrome.storage.local.get(['detailedFeedback', 'extractedData'], (data) => {
        console.log("Full data from storage:", data);
        console.log("Searching for fileName:", fileName);

        if (!data.extractedData || !Array.isArray(data.extractedData)) {
            console.log("extractedData is not an array or is undefined:", data.extractedData);
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        console.log("extractedData array:", data.extractedData);

        const matchingFile = data.extractedData.find(file => {
            console.log("Comparing:", file.fileName, "with", fileName);
            console.log("Stripped comparison:", file.fileName, "with", fileName.replace(/\\/g, ''));
            return file.fileName === fileName || file.fileName === fileName.replace(/\\/g, '');
        });

        if (!matchingFile) {
            console.log("No matching file found");
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        console.log("Matching file found:", matchingFile);

        if (data.detailedFeedback) {
            delete data.detailedFeedback[fileName];
            chrome.storage.local.set({ detailedFeedback: data.detailedFeedback }, () => {
                console.log('Removed existing detailed feedback for:', fileName);
            });
        }

        chrome.runtime.sendMessage({ action: 'getDetailedFeedback', fileName: fileName }, (response) => {
            if (response && response.detailedFeedback) {
                displayDetailedFeedback(
                    fileName,
                    response.detailedFeedback,
                    matchingFile.oldCode,
                    matchingFile.newCode,
                    matchingFile.fullContent,
                    detailedFeedbackDiv,
                    button
                );

                // Scroll detailedFeedbackDiv into view
                detailedFeedbackDiv.scrollIntoView({ behavior: 'smooth' });
            } else {
                detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to load detailed feedback.</p>';
            }
        });

    });
}