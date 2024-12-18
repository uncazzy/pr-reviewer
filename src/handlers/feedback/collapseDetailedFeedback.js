export function collapseDetailedFeedback(detailedFeedbackDiv, button) {
    // Hide the detailed feedback
    detailedFeedbackDiv.style.display = 'none';
    button.textContent = 'Expand Feedback';

    // Find the parent .file-feedback div
    const fileFeedbackDiv = detailedFeedbackDiv.closest('.file-feedback');

    if (fileFeedbackDiv) {
        const resultContainer = document.getElementById('result');
        const allFileFeedbackDivs = Array.from(resultContainer.querySelectorAll('.file-feedback'));
        const currentIndex = allFileFeedbackDivs.indexOf(fileFeedbackDiv);
        const topItemThreshold = 2; // Adjust based on how many top items need special handling

        if (currentIndex !== -1 && currentIndex < topItemThreshold) {
            // If the item is among the first few, apply scroll offset

            // Calculate the header height
            const header = document.querySelector('.header');
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