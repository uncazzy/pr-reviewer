import { expandFeedback } from '@handlers/feedback';
import { openChatWithFeedback } from '@handlers/chat/openChatWithFeedback';

/**
 * Creates the action buttons container with detailed feedback and chat buttons
 * @param fileName - The name of the file associated with these buttons
 * @returns An HTMLDivElement containing the action buttons
 */
export function createActionButtons(fileName: string): HTMLDivElement {
    const actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.className = 'action-buttons-container';

    // Create detailed feedback button
    const detailedButton = document.createElement('button');
    detailedButton.className = 'action-button detailed-button';
    detailedButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
    detailedButton.title = 'View detailed feedback';
    
    detailedButton.addEventListener('click', function(this: HTMLButtonElement) {
        const detailedFeedbackDiv = document.getElementById(`detailed-${CSS.escape(fileName)}`) as HTMLDivElement;
        if (detailedFeedbackDiv) {
            const isExpanded = detailedFeedbackDiv.style.display === 'block';
            // Toggle icon and title based on state
            this.innerHTML = isExpanded ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
            this.title = isExpanded ? 'View detailed feedback' : 'Collapse feedback';
            expandFeedback(fileName, this, detailedFeedbackDiv);
        }
    });

    // Create chat button
    const chatButton = document.createElement('button');
    chatButton.className = 'action-button chat-button';
    chatButton.innerHTML = '<i class="fas fa-comments"></i>';
    chatButton.title = 'Chat about this file';
    
    chatButton.addEventListener('click', async function() {
        const detailedFeedbackDiv = document.getElementById(`detailed-${CSS.escape(fileName)}`) as HTMLDivElement;
        if (detailedFeedbackDiv) {
            const fullContent = detailedFeedbackDiv.getAttribute('data-full-content')?.split('\n') || [];
            const feedback = detailedFeedbackDiv.textContent || '';
            openChatWithFeedback(fileName, feedback, fullContent);
        }
    });

    actionButtonsContainer.append(detailedButton, chatButton);
    return actionButtonsContainer;
}
