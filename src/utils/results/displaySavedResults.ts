import { createFileFeedback } from '@components/feedback/FileFeedback';

type FeedbackResult = Parameters<typeof createFileFeedback>[0];

export function displaySavedResults(
    results: FeedbackResult[] | null | undefined,
    resultDiv: HTMLElement
): void {
    if (!resultDiv) {
        console.error('resultDiv is not defined');
        return;
    }

    if (!Array.isArray(results) || results.length === 0) {
        resultDiv.style.display = 'none';
        return;
    }

    resultDiv.innerHTML = ''; // Clear any previous results
    results.sort((a, b) => a.index - b.index);
    results.forEach((result) => {
        createFileFeedback(result, resultDiv);
    });
    resultDiv.style.display = 'block';
}
