(async function () {
    console.log('Content script loaded');

    // Function to programmatically expand all files
    async function expandAllFiles() {
        const fileContainers = document.querySelectorAll('.file');
        let expandedCount = 0;

        for (const container of fileContainers) {
            const expandButton = container.querySelector('button.js-expand-full');
            const collapseButton = container.querySelector('button.js-collapse-diff');

            if (expandButton && expandButton.offsetParent !== null && !expandButton.hidden) {
                // File is not expanded, so expand it
                console.log("Expanding content...");
                expandButton.click();
                expandedCount++;
                // Wait for the content to load after expanding
                await new Promise(resolve => setTimeout(resolve, 500));
            } else if (collapseButton && expandButton.hidden) {
                // Content is already expanded, skip
                console.log("Content already expanded, skipping...");
            }
        }

        console.log(`Expanded ${expandedCount} out of ${fileContainers.length} files`);

        // Wait for content to load if any files were expanded
        if (expandedCount > 0) {
            await waitForContentLoad();
        }
    }

    // Function to wait for content to load
    function waitForContentLoad() {
        return new Promise((resolve) => {
            const maxWaitTime = 10000; // 10 seconds
            const startTime = Date.now();

            const checkContent = () => {
                const isLoading = document.querySelector('.js-diff-progressive-spinner, .js-diff-progressive-loader');
                if (!isLoading) {
                    resolve();
                } else if (Date.now() - startTime > maxWaitTime) {
                    console.warn('Content loading timed out');
                    resolve();
                } else {
                    setTimeout(checkContent, 100);
                }
            };

            checkContent();
        });
    }

    // First, expand all files
    await expandAllFiles();

    // Now proceed to extract file information
    // Get all the file containers in the PR
    const fileContainers = document.querySelectorAll('.file');

    console.log(`Found ${fileContainers.length} file containers`);

    let extractedData = [];

    // Sort fileContainers based on their order in the DOM
    const sortedFileContainers = Array.from(fileContainers).sort((a, b) => {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    for (let index = 0; index < sortedFileContainers.length; index++) {
        const fileContainer = sortedFileContainers[index];
        const fileInfo = extractFileInfo(fileContainer);
        if (fileInfo) {
            fileInfo.index = index; // Add index to preserve order
            extractedData.push(fileInfo);
            console.log('Extracted file info:', fileInfo);
        }
    }

    if (extractedData.length === 0) {
        console.warn('No file data extracted.');
    }

    // Send the extracted data to the background script
    chrome.runtime.sendMessage({ files: extractedData });

    // Function to extract file information
    function extractFileInfo(file) {
        const fileNameElement = file.querySelector('.file-info a');
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

        // Extract old and new code snippets (unchanged from before)
        const oldCode = Array.from(file.querySelectorAll('.blob-code-deletion .blob-code-inner'))
            .map(node => node.textContent.replace(/\s+$/, ''))
            .join('\n');

        const newCode = Array.from(file.querySelectorAll('.blob-code-addition .blob-code-inner'))
            .map(node => node.textContent.replace(/\s+$/, ''))
            .join('\n');

        // Log the extracted code snippets
        console.log(`File: ${fileName}`);
        console.log('Old Code:\n', oldCode);
        console.log('New Code:\n', newCode);
        console.log('Full New Content:\n', fullContent);

        return {
            fileName,
            oldCode,
            newCode,
            fullContent
        };
    }

})();
