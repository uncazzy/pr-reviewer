import { getBaseUrl } from "@utils/results";
import { setInStorage } from "@utils/storage";

/**
 * Maximum number of PRs to store in history
 */
const MAX_PR_LIMIT = 5;

/**
 * Represents the structure of extracted data for a single file
 */
interface ExtractedFileData {
    fileName: string;
    fileHref: string;
    fullContent: string;
    index: number;
    isLargeFile: boolean;
}

/**
 * Represents the structure of data stored for each PR
 */
interface PrData {
    extractedData: ExtractedFileData[];
}

/**
 * Represents the structure of data stored for all PRs
 */
interface ExtractedDataByPr {
    [prUrl: string]: PrData;
}

/**
 * Represents the structure of chrome storage data
 */
interface StorageData {
    extractedDataByPr?: ExtractedDataByPr;
    prOrder?: string[];
}

/**
 * Message type for extraction completion
 */
interface ExtractionCompleteMessage {
    type: 'extractionComplete';
    prUrl: string;
}

/**
 * Sends extracted data to storage and manages PR history
 * @param extractedData - Array of extracted file data
 */
export function sendExtractedData(extractedData: ExtractedFileData[]): void {
    const currentPrUrl = window.location.href;
    const baseUrl = getBaseUrl(currentPrUrl);

    chrome.storage.local.get('extractedDataByPr', (data: StorageData) => {

        const extractedDataByPr: ExtractedDataByPr = data.extractedDataByPr || {};
        let prOrder: string[] = data.prOrder || [];

        // Add the new PR to prOrder
        prOrder.push(baseUrl);


        // Check if the number of PRs exceeds the limit
        if (prOrder.length > MAX_PR_LIMIT) {
            // Remove the oldest PR
            const oldestPr = prOrder.shift(); // Removes the first element
            if (oldestPr) {
                delete extractedDataByPr[oldestPr];

            }
        }

        // Update the extractedDataByPr object directly
        extractedDataByPr[baseUrl] = {
            extractedData: extractedData
        };

        // Save back to storage
        setInStorage({ extractedDataByPr, prOrder }).then(() => {

            // Send a message indicating that extraction is complete
            const message: ExtractionCompleteMessage = {
                type: 'extractionComplete',
                prUrl: baseUrl
            };
            chrome.runtime.sendMessage(message);
        }).catch(error => {
            console.error('Error saving extracted data:', error);
        });
    });
}