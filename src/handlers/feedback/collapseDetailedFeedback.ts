/**
 * Collapses the detailed feedback view
 * @param detailedFeedbackDiv - The div element containing the detailed feedback
 * @param button - The button that toggles the feedback visibility
 */
export function collapseDetailedFeedback(
    detailedFeedbackDiv: HTMLElement,
    button: HTMLButtonElement
): void {
    // Hide the detailed feedback
    detailedFeedbackDiv.style.display = 'none';
    button.innerHTML = '<i class="fas fa-chevron-down"></i>';
    button.title = 'View detailed feedback';

    // Find the parent .file-feedback div
    const fileFeedbackDiv = detailedFeedbackDiv.closest('.file-feedback');

    if (fileFeedbackDiv) {
        const resultContainer = document.getElementById('result');
        if (!resultContainer) return;

        const allFileFeedbackDivs = Array.from(resultContainer.querySelectorAll<HTMLElement>('.file-feedback'));
        const currentIndex = allFileFeedbackDivs.indexOf(fileFeedbackDiv as HTMLElement);
        const topItemThreshold = 2; // Adjust based on how many top items need special handling

        if (currentIndex !== -1 && currentIndex < topItemThreshold) {
            // If the item is among the first few, apply scroll offset

            // Calculate the header height
            const header = document.querySelector<HTMLElement>('.header');
            const headerHeight = header ? header.offsetHeight : 0;

            // Calculate the position of the fileFeedbackDiv relative to the document
            const elementPosition = fileFeedbackDiv.getBoundingClientRect().top + window.pageYOffset;

            // Scroll to the element's position minus the header height and a small buffer
            window.scrollTo({
                top: elementPosition - headerHeight - 10, // Adjust the buffer as needed
                behavior: 'smooth'
            });
        } else {
            // For other items, use standard scrollIntoView
            fileFeedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}