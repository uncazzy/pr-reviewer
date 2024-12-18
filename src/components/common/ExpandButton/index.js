import { expandFeedback } from '@handlers/feedback';

export function createExpandButton(fileName) {
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Expand Feedback';
    expandButton.title = 'Expand detailed feedback';
    expandButton.addEventListener('click', function () {
        const detailedFeedbackDiv = document.getElementById(`detailed-${CSS.escape(fileName)}`);
        expandFeedback(fileName, this, detailedFeedbackDiv);
    });
    return expandButton;
}