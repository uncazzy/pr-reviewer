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

        const label = document.createElement('label');
        label.htmlFor = `file-${file.index}`;
        label.textContent = file.fileName;

        fileDiv.appendChild(checkbox);
        fileDiv.appendChild(label);
        form.appendChild(fileDiv);
    });

    // Append the form to the file picker div
    filePickerDiv.appendChild(form);
}
