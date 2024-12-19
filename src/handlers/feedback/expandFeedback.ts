import { fetchAndDisplayDetailedFeedback, displayDetailedFeedback, collapseDetailedFeedback } from '../feedback/index.ts';

interface FileData {
    fileName: string;
    fullContent: string;
}

interface StorageData {
    detailedFeedback?: {
        [fileName: string]: string;
    };
    extractedData?: FileData[];
}

export function expandFeedback(
    fileName: string,
    button: HTMLButtonElement,
    detailedFeedbackDiv: HTMLDivElement
): void {
    if (detailedFeedbackDiv.style.display === 'none' || detailedFeedbackDiv.style.display === '') {
        chrome.storage.local.get(['detailedFeedback', 'extractedData'], (data: StorageData) => {
            const fileData = data.extractedData?.find(file => file.fileName === fileName);

            if (!fileData) {
                fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button);
                return;
            }

            const { fullContent } = fileData;
            const contentLines = fullContent.split('\n');

            if (data.detailedFeedback?.[fileName]) {
                displayDetailedFeedback(fileName, data.detailedFeedback[fileName], contentLines, detailedFeedbackDiv, button);
            } else {
                fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button);
            }
        });
    } else {
        collapseDetailedFeedback(detailedFeedbackDiv, button);
    }
}