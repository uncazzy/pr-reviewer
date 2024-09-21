(async function() {
    console.log('Content script loaded');

    // Function to programmatically expand all files
    async function expandAllFiles() {
        const expandButtons = document.querySelectorAll('button.js-expand-full');

        console.log(`Found ${expandButtons.length} expand buttons`);

        for (const button of expandButtons) {
            if (button.offsetParent !== null) { // Check if the button is visible
                button.click();
            }
        }

        // Wait for content to load
        await waitForContentLoad();
    }

    // Function to wait for content to load
    function waitForContentLoad() {
        return new Promise((resolve) => {
            const observer = new MutationObserver((mutations, obs) => {
                const isLoading = document.querySelector('.js-diff-progressive-spinner, .js-diff-progressive-loader');
                if (!isLoading) {
                    obs.disconnect();
                    resolve();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
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
    
        // Select all code rows
        const codeRows = file.querySelectorAll('tr');
    
        codeRows.forEach(row => {
            const codeCell = row.querySelector('td.blob-code[data-split-side="right"]');
            if (!codeCell) return; // Skip rows without code cells
    
            // Capture the text content of the cell, including leading spaces
            let lineContent = codeCell.textContent;
    
            // Remove excessive newlines and spaces within the line
            lineContent = lineContent.replace(/\s*\n\s*/g, ' ');
    
            // Add line content to the result only if it's not empty
            if (lineContent !== '') {
                newFileLines.push(lineContent);
            } else if (newFileLines.length > 0 && newFileLines[newFileLines.length - 1] !== '') {
                // Add a single empty line between meaningful lines, but prevent consecutive empty lines
                newFileLines.push('');
            }
        });
    
        // Join the lines while preserving single new lines between actual code lines
        const fullContent = newFileLines.join('\n');
    
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
