import { getFileIcon } from "../../utils/getFileIcon.js"
import { getBaseUrl } from "../result/index.js";

export async function createFilePicker(filePickerDiv, extractedData) {
    if (!filePickerDiv) {
        console.error('filePickerDiv is not defined');
        return;
    }

    // Clear any existing content
    filePickerDiv.innerHTML = '';

    if (!extractedData || extractedData.length === 0) {
        filePickerDiv.innerHTML = '<p>No files found to display.</p>';
        return;
    }

    // Create a search bar
    const searchInput = document.createElement('input');
    searchInput.id = 'file-picker-search';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search files...';

    // Create file type filters
    const fileTypes = [...new Set(extractedData.map(file => file.fileName.split('.').pop().toLowerCase()))];
    const filterContainer = document.createElement('div');
    filterContainer.id = 'file-type-filters';

    fileTypes.forEach(type => {
        const filterButton = document.createElement('button');
        filterButton.className = 'filter-button';
        filterButton.textContent = `.${type}`;
        filterButton.dataset.type = type;
        filterButton.addEventListener('click', () => {
            toggleFileTypeFilter(type, filterButton);
        });
        filterContainer.appendChild(filterButton);
    });

    filePickerDiv.appendChild(searchInput);
    filePickerDiv.appendChild(filterContainer);

    // Create a form to contain the checkboxes
    const form = document.createElement('form');
    form.id = 'file-picker-form';

    // Create "Select All" and "Deselect All" buttons
    const selectButtonsContainer = document.createElement('div');
    selectButtonsContainer.id = 'select-buttons-container';

    const selectAllButton = document.createElement('button');
    selectAllButton.textContent = 'Select All';
    selectAllButton.addEventListener('click', (e) => {
        e.preventDefault();
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            const fileDiv = checkbox.closest('.file-picker-item');

            // Re-add the "large-file-unchecked" class only to large files
            if (fileDiv && fileDiv.classList.contains('large-file')) {
                fileDiv.classList.remove('large-file-unchecked');
            }
        });
    });

    const deselectAllButton = document.createElement('button');
    deselectAllButton.textContent = 'Deselect All';
    deselectAllButton.addEventListener('click', (e) => {
        e.preventDefault();
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;

            const fileDiv = checkbox.closest('.file-picker-item');

            // Re-add the "large-file-unchecked" class only to large files
            if (fileDiv && fileDiv.classList.contains('large-file')) {
                fileDiv.classList.add('large-file-unchecked');
            }
        });
    });

    selectButtonsContainer.appendChild(selectAllButton);
    selectButtonsContainer.appendChild(deselectAllButton);
    filePickerDiv.appendChild(selectButtonsContainer);

    // Render file list
    const fileListContainer = document.createElement('div');
    fileListContainer.id = 'file-list-container';

    extractedData.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-picker-item';
        fileDiv.dataset.type = file.fileName.split('.').pop().toLowerCase();

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'files';
        checkbox.value = file.fileName;
        checkbox.checked = !file.isLargeFile;  // Only check non-large files

        console.log("File:", file)

        checkbox.addEventListener('change', async (e) => {
            if (file.isLargeFile && e.target.checked) {

                if (file.fullContent.length > 1) {
                    console.log("File is already scraped, skipping...");
                    fileDiv.classList.remove('large-file-unchecked');
                    return;
                }

                console.log("File is checked, expanding and scraping...");
                fileDiv.classList.remove('large-file-unchecked');

                // Before sending the message, inject the content script
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    const activeTab = tabs[0];
                    const currentUrl = activeTab.url;  // Get the current URL
                    const basePrUrl = getBaseUrl(currentUrl);

                    // Now send the message to the content script, including the currentUrl
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: 'expandAndScrapeLargeFile',
                        fileName: file.fileName,
                        index: file.index,
                        basePrUrl: basePrUrl  // Pass the URL here
                    }, function (response) {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending message:', chrome.runtime.lastError.message);
                            return;
                        }

                        if (response && response.success) {
                            console.log('File expanded and scraped successfully');
                            // Optionally, update the UI or fetch updated data
                        } else {
                            console.error('Error expanding and scraping file:', response ? response.error : 'Unknown error');
                        }
                    });
                });
            } else if (file.isLargeFile && !e.target.checked) {
                fileDiv.classList.add('large-file-unchecked');
            }
        });

        const iconSpan = document.createElement('span');
        iconSpan.className = 'file-icon';

        // Determine the file extension
        const fileExtension = file.fileName.split('.').pop().toLowerCase();

        // Get the icon using the helper function
        iconSpan.innerHTML = getFileIcon(fileExtension);

        const label = document.createElement('label');
        label.textContent = file.fileName;

        if (file.isLargeFile) {
            fileDiv.title = 'This file is too large and needs manual expansion to be included in analysis.';
            fileDiv.classList.add('large-file', 'large-file-unchecked'); // Add a specific class for styling
        }

        // Add file type tag
        const fileTypeTag = document.createElement('span');
        fileTypeTag.className = 'file-type-tag';
        fileTypeTag.textContent = `.${fileExtension}`;

        fileDiv.appendChild(checkbox);
        fileDiv.appendChild(iconSpan);
        fileDiv.appendChild(label);
        fileDiv.appendChild(fileTypeTag);
        fileListContainer.appendChild(fileDiv);
    });

    form.appendChild(fileListContainer);
    filePickerDiv.appendChild(form);

    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const items = fileListContainer.querySelectorAll('.file-picker-item');
        items.forEach(item => {
            const label = item.querySelector('label');
            if (label && label.textContent.toLowerCase().includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Filter functionality
    function toggleFileTypeFilter(type, button) {
        const isActive = button.classList.toggle('active');
        const items = fileListContainer.querySelectorAll(`.file-picker-item[data-type="${type}"]`);
        items.forEach(item => {
            item.style.display = isActive ? 'none' : 'flex';
        });
    }
}