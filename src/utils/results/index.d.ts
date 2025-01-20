export function checkForResults(): Promise<void>;
export function displaySavedResults(results: Array<{ index: number;[key: string]: any }>,
    resultDiv: HTMLElement): Promise<void>;
export function getBaseUrl(url: string): string;
