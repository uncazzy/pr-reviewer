import { openChatWithFeedback } from '../../handlers/chatHandler.js';
import { collapseDetailedFeedback } from './collapseDetailedFeedback.js';
import { refreshDetailedFeedback } from './refreshDetailedFeedback.js';

export function displayDetailedFeedback(fileName, feedback, oldCode, newCode, fullContent, detailedFeedbackDiv, button) {
    const parsedContent = marked.parse(feedback);
    detailedFeedbackDiv.innerHTML = parsedContent;
    detailedFeedbackDiv.querySelectorAll('pre code').forEach((block) => {
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
        openChatWithFeedback(fileName, feedback, fullContent, newCode, oldCode);  // Pass all code data to chat
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
    refreshButton.title = 'Refresh Feedback';
    refreshButton.addEventListener('click', () => refreshDetailedFeedback(fileName, detailedFeedbackDiv, button));
    collapseAndRefreshButtonContainer.appendChild(refreshButton);

    // Append collapse & refresh container to main button container
    buttonContainer.appendChild(collapseAndRefreshButtonContainer);

    // Append button container below the detailed feedback
    detailedFeedbackDiv.appendChild(buttonContainer);

    detailedFeedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
