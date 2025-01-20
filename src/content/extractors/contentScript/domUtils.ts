/**
 * Configuration for content loading
 */
interface ContentLoadConfig {
    maxWaitTime: number;
    checkInterval: number;
}

/**
 * Default configuration for content loading
 */
const DEFAULT_CONTENT_LOAD_CONFIG: ContentLoadConfig = {
    maxWaitTime: 10000, // 10 seconds
    checkInterval: 100  // 100ms
};

/**
 * Programmatically expands all files in the diff view
 * @returns Promise that resolves when all files are expanded
 */
export async function expandAllFiles(): Promise<void> {
    const fileContainers = document.querySelectorAll<HTMLElement>('.file');
    let expandedCount = 0;

    for (const container of fileContainers) {
        const expandButton = container.querySelector<HTMLButtonElement>('button.js-expand-full');
        const collapseButton = container.querySelector<HTMLButtonElement>('button.js-collapse-diff');

        if (!expandButton) continue;

        if (expandButton.offsetParent !== null && !expandButton.hidden) {

            expandButton.click();
            expandedCount++;

            // Wait for content to load after expanding
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (collapseButton && expandButton.hidden) {
            // File is already expanded, skipping...
        }
    }

    if (expandedCount > 0) {
        await waitForContentLoad();
    } else {
       // No files were expanded. Maybe all files were already expanded
    }
}

/**
 * Waits for content to load by checking for loading spinners
 * @param config - Optional configuration for wait times
 * @returns Promise that resolves when content is loaded or timeout is reached
 */
export function waitForContentLoad(config: Partial<ContentLoadConfig> = {}): Promise<void> {
    const { maxWaitTime, checkInterval } = { ...DEFAULT_CONTENT_LOAD_CONFIG, ...config };

    return new Promise((resolve) => {
        const startTime = Date.now();

        const checkContent = () => {
            const isLoading = document.querySelector<HTMLElement>(
                '.js-diff-progressive-spinner, .js-diff-progressive-loader'
            );

            if (!isLoading) {
                resolve();
            } else if (Date.now() - startTime > maxWaitTime) {
                
                resolve();
            } else {
                setTimeout(checkContent, checkInterval);
            }
        };

        checkContent();
    });
}
