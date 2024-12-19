export interface FeedbackMessage {
    fileName: string;
    fileURL: string;
    status: string;
    issue: string;
    index: number;
    [key: string]: any;
}

/**
 * Creates the entire feedback UI for a single file
 * @param message - The feedback message containing file details and status
 * @param resultDiv - The container element where the feedback will be appended
 */
export function createFileFeedback(message: FeedbackMessage, resultDiv: HTMLElement): void;
