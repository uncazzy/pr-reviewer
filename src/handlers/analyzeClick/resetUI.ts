/**
 * Resets the UI state by clearing storage and resetting DOM elements.
 * 
 * @param resultDiv - The div element that displays results
 * @param loadingDiv - The div element that shows loading state
 * @param analyzeButton - The button element used to trigger analysis
 * @returns A promise that resolves when the UI has been reset
 */
export function resetUI(
    resultDiv: HTMLDivElement,
    loadingDiv: HTMLDivElement,
    analyzeButton: HTMLButtonElement
): Promise<void> {
    return new Promise<void>((resolve) => {
        const keysToRemove: string[] = ['prResults', 'processingComplete', 'extractedData'];
        
        chrome.storage.local.remove(keysToRemove, () => {
            // Reset DOM elements
            resultDiv.innerHTML = '';
            resultDiv.style.display = 'none';
            loadingDiv.style.display = 'block';
            analyzeButton.disabled = true;
            
            resolve();
        });
    });
}