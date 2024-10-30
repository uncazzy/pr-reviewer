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

        // Capture the line number cell
        let lineNumberCell = row.querySelector('td[data-line-number]');
        let lineNumber = lineNumberCell ? lineNumberCell.getAttribute('data-line-number') : null;

        // Capture the text content of the code cell, including leading spaces
        let lineContent = codeCell.querySelector('.blob-code-inner')?.innerText || codeCell.innerText;

        // Add line number and line content to the result
        if (lineNumber) {
            newFileLines.push(`${lineNumber}: ${lineContent}`);
        } else {
            newFileLines.push(lineContent); // For cases where line number isn't available
        }
    });

    // Join the lines while preserving the original code structure
    let fullContent = newFileLines.join('\n');

    // Remove excessive blank lines (more than two consecutive newlines)
    fullContent = fullContent.replace(/\n{3,}/g, '\n\n');

    // Extract old code snippets with line numbers
    const oldCode = Array.from(file.querySelectorAll('.blob-code-deletion'))
        .map(row => {
            // Access the line number in the preceding sibling <td>
            const lineNumberCell = row.previousElementSibling;
            const lineNumber = lineNumberCell?.getAttribute('data-line-number');
            const lineContent = row.querySelector('.blob-code-inner')?.innerText.trim();
            return lineNumber ? `${lineNumber}: ${lineContent}` : lineContent;
        })
        .filter(Boolean) // Remove any null/undefined entries
        .join('\n');

    // Extract new code snippets with line numbers
    const newCode = Array.from(file.querySelectorAll('.blob-code-addition'))
        .map(row => {
            // Access the line number in the preceding sibling <td>
            const lineNumberCell = row.previousElementSibling;
            const lineNumber = lineNumberCell?.getAttribute('data-line-number');
            const lineContent = row.querySelector('.blob-code-inner')?.innerText.trim();
            return lineNumber ? `${lineNumber}: ${lineContent}` : lineContent;
        })
        .filter(Boolean)
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
