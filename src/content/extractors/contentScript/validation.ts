import type { FileInfo } from '../../../types/extraction';
import type { ValidationError } from '../../../types/global';

export function validateFileInfo(file: FileInfo): ValidationError | null {
    if (!file.fileHref) {
        return { field: 'fileHref', message: 'Missing file href' };
    }

    if (!file.fileName) {
        return { field: 'fileName', message: 'Missing file name' };
    }

    if (typeof file.index !== 'number' || file.index < 0) {
        return { field: 'index', message: 'Invalid index' };
    }

    if (typeof file.isLargeFile !== 'boolean') {
        return { field: 'isLargeFile', message: 'Invalid isLargeFile flag' };
    }

    return null;
}

export function validateExtractedData(files: FileInfo[]): ValidationError | null {
    if (!Array.isArray(files) || files.length === 0) {
        return { field: 'extractedData', message: 'No files extracted' };
    }

    // Check for unique filenames
    const fileNames = new Set<string>();
    for (const file of files) {
        if (fileNames.has(file.fileName)) {
            return { field: 'fileName', message: `Duplicate file name: ${file.fileName}` };
        }
        fileNames.add(file.fileName);

        // Validate each file
        const fileError = validateFileInfo(file);
        if (fileError) {
            return fileError;
        }
    }

    return null;
}
