export interface FileInfo {
    fileHref: string;
    fileName: string;
    fullContent: string;
    index: number;
    isLargeFile: boolean;
}

export interface ExtractedData {
    extractedData: FileInfo[];
}

export interface ExtractedDataByPr {
    [key: string]: ExtractedData;
}

export interface ExtractionAttempt {
    timestamp: number;
    error?: string;
    filesCount: number;
}

export interface ExtractionState {
    attempts: ExtractionAttempt[];
    maxRetries: number;
    retryDelay: number;
}
