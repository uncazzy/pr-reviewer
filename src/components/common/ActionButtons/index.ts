import { expandFeedback } from '@handlers/feedback';
import { openChatWithFeedback } from '@handlers/chat/openChatWithFeedback';
import { getCurrentTabPrUrl } from '@utils/tabs/getCurrentTabPrUrl';

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

    detailedButton.addEventListener('click', function (this: HTMLButtonElement) {
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

    chatButton.addEventListener('click', async function () {
        const baseUrl = await getCurrentTabPrUrl();


        if (!baseUrl) {
            console.error('Could not get PR URL');
            return;
        }

        chrome.storage.local.get(['extractedDataByPr'], (data: any) => {



            const prData = data.extractedDataByPr?.[baseUrl];


            if (prData) {
                const fileData = prData.extractedData?.find((file: any) => file.fileName === fileName);
                const feedback = prData.detailedFeedback?.[fileName] || '';
                const fullContent = fileData?.fullContent?.split('\n') || [];

                // Get initial result for this file
                const initialResult = prData.results?.find((result: any) => result.fileName === fileName);
                const initialFeedback = initialResult ? `Status: ${initialResult.status}\nIssue: ${initialResult.issue}` : '';

                // Combine initial feedback with detailed feedback
                const combinedFeedback = initialFeedback + (feedback ? `\n\nDetailed Feedback:\n${feedback}` : '');





                openChatWithFeedback(fileName, combinedFeedback, fullContent);
            } else {
                console.error('No PR data found for:', baseUrl);
            }
        });
    });

    actionButtonsContainer.append(detailedButton, chatButton);
    return actionButtonsContainer;
}
