import { getFileIcon } from "../../utils/getFileIcon.js"

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
        });
    });

    const deselectAllButton = document.createElement('button');
    deselectAllButton.textContent = 'Deselect All';
    deselectAllButton.addEventListener('click', (e) => {
        e.preventDefault();
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
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
        checkbox.disabled = file.isLargeFile;  // Disable checkbox for large files


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
            fileDiv.classList.add('large-file'); // Add a specific class for styling
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