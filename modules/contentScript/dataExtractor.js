// Function to extract file information
export function extractFileInfo(file, index, isLargeFileFlag) {
    console.log("isLargeFileFlag inside of extractFileInfo:", isLargeFileFlag)
    const fileNameElement = file.querySelector('.file-info .Truncate a');
    if (!fileNameElement) {
        console.warn('File name element not found');
        return null;
    }

    const fileName = fileNameElement.textContent.trim();
    const newFileLines = [];

    // Select all code rows, including those with context and additions
    const codeRows = file.querySelectorAll('tr');

    codeRows.forEach(row => {
        // Select the code cell, including context, deletions, and excluding hunk headers and left-side cells in split diffs
        let codeCell = row.querySelector(
            'td.blob-code:not(.blob-code-hunk):not([data-split-side="left"])'
        );

        if (!codeCell) return; // Skip rows without code cells

        // Capture the text content of the cell, including leading spaces
        let lineContent = codeCell.querySelector('.blob-code-inner')?.innerText || codeCell.innerText;

        // Add line content to the result
        newFileLines.push(lineContent);
    });

    // Join the lines while preserving the original code structure
    let fullContent = newFileLines.join('\n');

    // Remove excessive blank lines (more than two consecutive newlines)
    fullContent = fullContent.replace(/\n{3,}/g, '\n\n');

    // Extract old and new code snippets
    const oldCode = Array.from(file.querySelectorAll('.blob-code-deletion .blob-code-inner'))
        .map(node => node.textContent.replace(/\s+$/, ''))
        .join('\n');

    const newCode = Array.from(file.querySelectorAll('.blob-code-addition .blob-code-inner'))
        .map(node => node.textContent.replace(/\s+$/, ''))
        .join('\n');

    // Use the initial isLargeFile flag or detect if it has a "Load diff" button
    const isLargeFile = isLargeFileFlag || !!file.querySelector('button.load-diff-button');

    return {
        fileName,
        oldCode,
        newCode,
        fullContent,
        index,
        isLargeFile
    };
}

// Function to extract data from all files
export function extractAllFilesData() {
    const fileContainers = document.querySelectorAll('.file');
    console.log(`Found ${fileContainers.length} file containers`);

    let extractedData = [];

    // Sort fileContainers based on their order in the DOM
    const sortedFileContainers = Array.from(fileContainers).sort((a, b) => {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    for (let index = 0; index < sortedFileContainers.length; index++) {
        const fileContainer = sortedFileContainers[index];
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
