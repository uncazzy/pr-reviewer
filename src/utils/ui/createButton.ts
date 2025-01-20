/**
 * Creates a button element with specified class name, inner HTML, and click handler
 * @param className - The class name for the button
 * @param innerHTML - The inner HTML for the button
 * @param onClick - The click event handler for the button
 * @returns The button element
 */
export function createButton(className: string, innerHTML: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = className;
    button.innerHTML = innerHTML;
    button.addEventListener('click', onClick);
    return button;
}
