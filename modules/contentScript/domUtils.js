// Function to programmatically expand all files
export async function expandAllFiles() {
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
