export function createFileName(fileName) {
    const fileNameDiv = document.createElement('div');
    fileNameDiv.className = 'file-name';
    fileNameDiv.textContent = `File: ${fileName}`;
    return fileNameDiv;
}