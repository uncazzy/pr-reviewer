export function extractFileInfo(file, index, isLargeFileFlag) {
    const fileNameElement = file.querySelector('.file-info .Truncate a');
    const fileHref = fileNameElement.getAttribute('href');

    if (!fileNameElement || !fileHref) {
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

        // Capture the line number cell
        let lineNumberCell = row.querySelector('td.js-blob-rnum[data-line-number]');
        let lineNumber = lineNumberCell ? lineNumberCell.getAttribute('data-line-number') : null;

        // Access the code marker
        let codeMarkerElement = codeCell.querySelector('.blob-code-inner.blob-code-marker');
        let codeMarker = codeMarkerElement ? codeMarkerElement.getAttribute('data-code-marker') : '';

        // Get the line content
        let lineContentText = codeCell.querySelector('.blob-code-inner')?.innerText || codeCell.innerText;
        let lineContent = lineContentText;

        // Include the current line
        if (lineNumber) {
            let prefix = codeMarker || ' '; // Use '+' for additions, ' ' for unchanged lines
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