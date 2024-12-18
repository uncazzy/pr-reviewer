import { expandFeedback } from '@handlers/feedback';

/**
 * Creates an expand button for showing detailed feedback
 * @param fileName - The name of the file associated with this button
 * @returns An HTMLButtonElement for expanding feedback
 */
export function createExpandButton(fileName: string): HTMLButtonElement {
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Expand Feedback';
    expandButton.title = 'Expand detailed feedback';
    
    expandButton.addEventListener('click', function(this: HTMLButtonElement) {
        const detailedFeedbackDiv = document.getElementById(`detailed-${CSS.escape(fileName)}`);
        if (detailedFeedbackDiv) {
            expandFeedback(fileName, this, detailedFeedbackDiv);
        }
    });
    
    return expandButton;
}
