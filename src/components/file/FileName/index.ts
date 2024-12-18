/**
 * Creates a file name element with a clickable link
 * @param fileName - The name of the file to display
 * @param fileURL - The URL that the file link should navigate to
 * @returns An HTMLDivElement containing the file name and link
 */
export function createFileName(fileName: string, fileURL: string): HTMLDivElement {
    // Create a container div for the file name
    const fileNameDiv = document.createElement('div');
    fileNameDiv.className = 'file-name';

    // Add "File:" text as a regular span
    const fileLabel = document.createElement('span');
    fileLabel.textContent = 'File: ';
    fileNameDiv.appendChild(fileLabel);

    // Create the link element for the actual file name
    const fileLink = document.createElement('a');
    fileLink.href = '#'; // Temporary placeholder, navigation will be handled by the click event
    fileLink.textContent = fileName;
    fileLink.className = 'file-name-link';

    // Set up click event to open link in the current tab
    fileLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && tabs[0].id) {
                const currentTabId = tabs[0].id;
                chrome.tabs.update(currentTabId, { url: fileURL });
            }
        });
    });

    // Append the file link to the container div
    fileNameDiv.appendChild(fileLink);

    return fileNameDiv;
}
