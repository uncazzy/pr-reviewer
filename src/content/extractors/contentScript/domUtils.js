// Function to programmatically expand all files
export async function expandAllFiles() {
    const fileContainers = document.querySelectorAll('.file');
    let expandedCount = 0;

    for (const container of fileContainers) {
        const expandButton = container.querySelector('button.js-expand-full');
        const collapseButton = container.querySelector('button.js-collapse-diff');

        if (expandButton && expandButton.offsetParent !== null && !expandButton.hidden) {
            console.log(`Expanding file container...`);
            expandButton.click();
            expandedCount++;

            // Wait for content to load after expanding
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (collapseButton && expandButton.hidden) {
            console.log("File is already expanded, skipping...");
        }
    }

    console.log(`Expanded ${expandedCount} out of ${fileContainers.length} files`);

    if (expandedCount > 0) {
        console.log('Waiting for content to fully load after expanding...');
        await waitForContentLoad();
    } else {
        console.warn('No files were expanded. Maybe all files were already expanded.');
    }
}

// Function to wait for content to load
export function waitForContentLoad() {
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
