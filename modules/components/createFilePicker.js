import { getFromStorage } from '../storage/index.js';

export async function createFilePicker(filePickerDiv) {
    // Clear any existing content
    filePickerDiv.innerHTML = '';

    // Fetch the extracted data from storage
    const { extractedData } = await getFromStorage('extractedData');

    if (!extractedData || extractedData.length === 0) {
        filePickerDiv.innerHTML = '<p>No files found to display.</p>';
        return;
    }

    // Create a form to contain the checkboxes
    const form = document.createElement('form');
    form.id = 'file-picker-form';

    // Create a "Select All" checkbox
    const selectAllDiv = document.createElement('div');
    selectAllDiv.className = 'file-picker-item';

    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.id = 'select-all';
    selectAllCheckbox.checked = true;

    const selectAllLabel = document.createElement('label');
    selectAllLabel.htmlFor = 'select-all';
    selectAllLabel.textContent = 'Select All';

    selectAllDiv.appendChild(selectAllCheckbox);
    selectAllDiv.appendChild(selectAllLabel);
    form.appendChild(selectAllDiv);

    // Event listener for "Select All" checkbox
    selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:not(#select-all)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    // Create checkboxes for each file
    extractedData.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-picker-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `file-${file.index}`;
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
            default:
                iconSpan.innerHTML = '<i class="fas fa-file-alt"></i>';
        }

        const label = document.createElement('label');
        label.htmlFor = `file-${file.index}`;
        label.textContent = file.fileName;

        fileDiv.appendChild(checkbox);
        fileDiv.appendChild(iconSpan);
        fileDiv.appendChild(label);
        form.appendChild(fileDiv);

        // Event listener for individual checkboxes
        checkbox.addEventListener('change', () => {
            if (!checkbox.checked) {
                selectAllCheckbox.checked = false;
            } else {
                const allChecked = [...form.querySelectorAll('input[name="files"]')].every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
            }
        });
    });

    // Append the form to the file picker div
    filePickerDiv.appendChild(form);
}