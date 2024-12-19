interface ExtractedData {
    fileName: string;
    filePath: string;
    fileContent?: string;
    // Add other properties that might be in extractedData
}

export function createFilePicker(
    filePickerDiv: HTMLElement,
    extractedData: ExtractedData[]
): Promise<void>;
