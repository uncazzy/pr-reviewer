export function collapseDetailedFeedback(fileName: string, button: HTMLButtonElement, detailedFeedbackDiv: HTMLElement): void;
export function displayDetailedFeedback(fileName: string, feedbackData: any): void;
export function expandFeedback(fileName: string, button: HTMLButtonElement, detailedFeedbackDiv: HTMLElement): void;
export function fetchAndDisplayDetailedFeedback(fileName: string): Promise<void>;
export function refreshDetailedFeedback(fileName: string): Promise<void>;
