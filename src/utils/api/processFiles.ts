import { setInStorage, getFromStorage } from '@utils/storage';
import { analyzeCodeWithGPT } from '@utils/api';
import { parseFeedback } from '@utils/feedback';

interface SelectedFile {
    fileName: string;
    fullContent: string;
    fileHref: string;
    index: number;
}

interface ParsedFeedback {
    status: string;
    issue: string;
}

interface FileResult {
    fileName: string;
    fileURL: string;
    status: string;
    issue: string;
    index?: number;
}

interface PRData {
    results?: FileResult[];
    extractedData?: unknown[];
}

interface ExtractedDataByPr {
    [prUrl: string]: PRData;
}

/**
 * Process multiple files concurrently for code review
 * @param selectedFiles - Array of files to process
 * @param prUrl - URL of the pull request
 * @returns Promise that resolves when all files are processed
 * @throws Error if there's an unexpected error during processing
 */
export async function processFiles(
    selectedFiles: SelectedFile[],
    prUrl: string
): Promise<void> {
    const results: FileResult[] = [];
    try {
        const promises = selectedFiles.map((file) =>
            analyzeCodeWithGPT(file.fileName, file.fullContent)
                .then((feedback: string) => {
                    const parsedFeedback = parseFeedback(feedback) as ParsedFeedback;
                    const fileURL = prUrl + '/files' + file.fileHref;
                    return {
                        fileName: file.fileName,
                        fileURL,
                        status: parsedFeedback.status,
                        issue: parsedFeedback.issue,
                        index: file.index
                    };
                })
                .catch((error: Error) => ({
                    fileName: file.fileName,
                    fileURL: prUrl + '/files' + file.fileHref,
                    status: 'Error',
                    issue: error.message
                }))
        );

        const settledPromises = await Promise.allSettled(promises);
        settledPromises.forEach((result) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                // File processing failed
            }
        });

        // Retrieve existing extractedDataByPr from storage
        const extractedDataByPr: ExtractedDataByPr = await getFromStorage('extractedDataByPr') || {};

        // Ensure prData exists
        if (!extractedDataByPr[prUrl]) {
            extractedDataByPr[prUrl] = {};
        }

        // Save the results
        extractedDataByPr[prUrl].results = results;

        // Save updated extractedDataByPr to storage
        await setInStorage({ extractedDataByPr });

        // Save processingComplete flag
        await setInStorage({ processingComplete: true });


    } catch (error) {
        console.error('Unexpected error:', error);
        await setInStorage({ error: error instanceof Error ? error.message : String(error) });
        throw error; // Re-throw the error for proper error handling upstream
    }
}
