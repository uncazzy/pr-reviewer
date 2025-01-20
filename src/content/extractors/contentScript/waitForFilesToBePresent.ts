/**
 * Configuration for file presence check
 */
interface FileCheckConfig {
    maxAttempts: number;
    checkInterval: number;
}

/**
 * Default configuration for file presence check
 */
const DEFAULT_FILE_CHECK_CONFIG: FileCheckConfig = {
    maxAttempts: 20,  // Wait up to 10 seconds (20 attempts * 500ms)
    checkInterval: 500 // Check every 500ms
};

/**
 * Waits for file containers to be present in the DOM
 * @param config - Optional configuration for wait times
 * @returns Promise that resolves when files are present or timeout is reached
 * @throws Never throws, always resolves (either with files present or timeout)
 */
export async function waitForFilesToBePresent(
    config: Partial<FileCheckConfig> = {}
): Promise<void> {
    const { maxAttempts, checkInterval } = { ...DEFAULT_FILE_CHECK_CONFIG, ...config };

    return new Promise<void>((resolve) => {
        let attempts = 0;

        const checkFiles = () => {
            const fileContainers = document.querySelectorAll<HTMLElement>('.file');

            if (fileContainers.length > 0) {

                resolve();
                return;
            }

            attempts++;
            if (attempts < maxAttempts) {

                setTimeout(checkFiles, checkInterval);
            } else {

                resolve(); // Proceed even if files are not present
            }
        };

        checkFiles();
    });
}