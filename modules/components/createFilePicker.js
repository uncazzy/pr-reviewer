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
        checkbox.checked = true;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'file-icon';

        // Determine the file extension
        const fileExtension = file.fileName.split('.').pop().toLowerCase();

        // Assign an icon based on file extension
        switch (fileExtension) {
            case 'js':
                iconSpan.innerHTML = '<i class="fab fa-js-square"></i>';
                break;
            case 'jsx':
            case 'tsx':
                iconSpan.innerHTML = '<i class="fab fa-react"></i>';
                break;
            case 'ts':
                iconSpan.innerHTML = '<i class="fab fa-js-square"></i>'; // or a TypeScript-specific icon
                break;
            case 'css':
                iconSpan.innerHTML = '<i class="fab fa-css3-alt"></i>';
                break;
            case 'html':
                iconSpan.innerHTML = '<i class="fab fa-html5"></i>';
                break;
            case 'py':
                iconSpan.innerHTML = '<i class="fab fa-python"></i>';
                break;
            case 'java':
                iconSpan.innerHTML = '<i class="fab fa-java"></i>';
                break;
            case 'json':
                iconSpan.innerHTML = '<i class="fas fa-database"></i>';
                break;
            case 'xml':
            case 'yml':
            case 'yaml':
                iconSpan.innerHTML = '<i class="fas fa-code"></i>';
                break;
            case 'md':
                iconSpan.innerHTML = '<i class="fab fa-markdown"></i>';
                break;
            case 'sh':
            case 'bash':
                iconSpan.innerHTML = '<i class="fas fa-terminal"></i>';
                break;
            case 'php':
                iconSpan.innerHTML = '<i class="fab fa-php"></i>';
                break;
            case 'rb':
                iconSpan.innerHTML = '<i class="fas fa-gem"></i>';
                break;
            case 'cpp':
            case 'c':
                iconSpan.innerHTML = '<i class="fas fa-copyright"></i>'; // Use custom icons for C/C++
                break;
            case 'go':
                iconSpan.innerHTML = '<i class="fab fa-golang"></i>'; // Add Golang icon if available
                break;
            case 'sql':
                iconSpan.innerHTML = '<i class="fas fa-database"></i>';
                break;
            case 'dockerfile':
            case 'docker':
                iconSpan.innerHTML = '<i class="fab fa-docker"></i>';
                break;
            default:
                iconSpan.innerHTML = '<i class="fas fa-file-alt"></i>';
        }


        const label = document.createElement('label');
        label.textContent = file.fileName;

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