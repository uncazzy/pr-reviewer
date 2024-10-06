export async function waitForFilesToBePresent() {
    return new Promise((resolve, reject) => {
        const maxAttempts = 20; // Wait up to 10 seconds
        let attempts = 0;

        const checkFiles = () => {
            const fileContainers = document.querySelectorAll('.file');
            if (fileContainers.length > 0) {
                resolve();
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkFiles, 500);
                } else {
                    console.warn('Timed out waiting for files to be present.');
                    resolve(); // Proceed even if files are not present
                }
            }
        };
        checkFiles();
    });
}