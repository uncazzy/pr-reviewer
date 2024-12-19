import { openChatWithFeedback } from '@/handlers/chat';
import { collapseDetailedFeedback } from './collapseDetailedFeedback';
import { refreshDetailedFeedback } from './refreshDetailedFeedback';
import { marked } from 'marked';
import hljs from 'highlight.js';

/**
 * Displays detailed feedback for a file with syntax highlighting and interactive buttons
 * @param fileName - Name of the file being reviewed
 * @param feedback - The feedback content in markdown format
 * @param fullContent - The full content of the file being reviewed
 * @param detailedFeedbackDiv - The div element to display the feedback in
 * @param button - The button that toggles the feedback visibility
 */
export async function displayDetailedFeedback(
    fileName: string,
    feedback: string,
    fullContent: string[],
    detailedFeedbackDiv: HTMLElement,
    button: HTMLButtonElement
): Promise<void> {
    // Parse markdown content
    const parsedContent = await Promise.resolve(marked.parse(feedback));
    detailedFeedbackDiv.innerHTML = parsedContent;
    
    // Apply syntax highlighting
    detailedFeedbackDiv.querySelectorAll<HTMLElement>('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    detailedFeedbackDiv.style.display = 'block';
    button.textContent = 'Collapse Feedback';

    // Create a container for both the buttons (Refresh and Ask Follow-up)
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // "Ask Follow-up" button
    const askFollowUpButton = document.createElement('button');
    askFollowUpButton.className = 'follow-up-button';
    askFollowUpButton.innerHTML = '<i class="fas fa-comments"></i> Ask Follow-up';
    askFollowUpButton.title = 'Chat and ask questions about this file';
    askFollowUpButton.addEventListener('click', () => {
        openChatWithFeedback(fileName, feedback, fullContent);  // Pass all code data to chat
    });
    buttonContainer.appendChild(askFollowUpButton);

    // Collapse & Refresh buttons container
    const collapseAndRefreshButtonContainer = document.createElement('div');

    // Collapse Feedback button
    const collapseButton = document.createElement('button');
    collapseButton.className = 'collapse-button';
    collapseButton.innerHTML = '<i class="fas fa-times"></i>';
    collapseButton.title = 'Collapse Feedback';
    collapseButton.addEventListener('click', () => collapseDetailedFeedback(detailedFeedbackDiv, button));
    collapseAndRefreshButtonContainer.appendChild(collapseButton);

    // Refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
    refreshButton.title = 'Regenerate Feedback';
    refreshButton.addEventListener('click', () => refreshDetailedFeedback(fileName, detailedFeedbackDiv, button));
    collapseAndRefreshButtonContainer.appendChild(refreshButton);

    // Append collapse & refresh container to main button container
    buttonContainer.appendChild(collapseAndRefreshButtonContainer);

    // Insert the button container at the top of the detailed feedback div
    detailedFeedbackDiv.insertBefore(buttonContainer, detailedFeedbackDiv.firstChild);

    detailedFeedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
