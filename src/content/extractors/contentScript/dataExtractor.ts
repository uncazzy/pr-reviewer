export interface FileInfo {
    fileHref: string;
    fileName: string;
    fullContent: string;
    index: number;
    isLargeFile: boolean;
}

/**
 * Extracts information from a file container element
 * @param file - The file container element
 * @param index - The index of the file in the list
 * @param isLargeFileFlag - Flag indicating if the file is large
 * @returns FileInfo object or null if extraction fails
 */
export function extractFileInfo(
    file: Element,
    index: number,
    isLargeFileFlag: boolean | null
): FileInfo | null {
    const fileNameElement = file.querySelector<HTMLAnchorElement>('.file-info .Truncate a');
    if (!fileNameElement) {
        console.warn('File name element not found');
        return null;
    }

    const fileHref = fileNameElement.getAttribute('href');
    if (!fileHref) {
        console.warn('File href not found');
        return null;
    }

    const fileName = fileNameElement.textContent?.trim() || '';
    const newFileLines: string[] = [];

    // Select all code rows, including those with context and additions
    const codeRows = file.querySelectorAll('tr');

    codeRows.forEach(row => {
        // Select the code cell, including context, deletions, and excluding hunk headers and left-side cells in split diffs
        const codeCell = row.querySelector<HTMLTableDataCellElement>(
            'td.blob-code:not(.blob-code-hunk):not([data-split-side="left"])'
        );
        if (!codeCell) return; // Skip rows without code cells

        // Capture the line number cell
        const lineNumberCell = row.querySelector<HTMLTableDataCellElement>('td.js-blob-rnum[data-line-number]');
        const lineNumber = lineNumberCell?.getAttribute('data-line-number') || null;

        // Access the code marker
        const codeMarkerElement = codeCell.querySelector<HTMLElement>('.blob-code-inner.blob-code-marker');
        const codeMarker = codeMarkerElement?.getAttribute('data-code-marker') || '';

        // Get the line content
        const lineContentElement = codeCell.querySelector<HTMLElement>('.blob-code-inner');
        const lineContent = lineContentElement ? lineContentElement.innerText : codeCell.innerText;

        // Include the current line
        if (lineNumber) {
            const prefix = codeMarker || ' '; // Use '+' for additions, ' ' for unchanged lines
            newFileLines.push(`${lineNumber}: ${prefix}${lineContent}`);
        } else {
            newFileLines.push(lineContent); // For cases where line number isn't available
        }
    });

    // Join the lines while preserving the original code structure
    let fullContent = newFileLines.join('\n');

    // Remove excessive blank lines (more than two consecutive newlines)
    fullContent = fullContent.replace(/\n{3,}/g, '\n\n');

    // Use the initial isLargeFile flag or detect if it has a "Load diff" button
    const isLargeFile = isLargeFileFlag || !!file.querySelector('button.load-diff-button');

    return {
        fileHref,
        fileName,
        fullContent,
        index,
        isLargeFile
    };
}

/**
 * Extracts data from all file containers in the document
 * @returns Array of FileInfo objects
 */
export function extractAllFilesData(): FileInfo[] {
    const fileContainers = document.querySelectorAll('.file');
    console.log(`Found ${fileContainers.length} file containers`);

    const extractedData: FileInfo[] = [];

    // Sort fileContainers based on their order in the DOM
    const sortedFileContainers = Array.from(fileContainers).sort((a, b) => {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    for (let index = 0; index < sortedFileContainers.length; index++) {
        const fileContainer = sortedFileContainers[index];
        if (!fileContainer) {
            console.warn(`File container at index ${index} not found`);
            continue;
        }
        const fileInfo = extractFileInfo(fileContainer, index, null);
        if (fileInfo) {
            extractedData.push(fileInfo);
            console.log('Extracted file info:', fileInfo);
        }
    }

    if (extractedData.length === 0) {
        console.warn('No file data extracted.');
    }

    return extractedData;
}