import { getApiKey, getModel, getFromStorage, setInStorage } from './storage.js';
import { createDetailedFeedbackPrompt } from '../prompts/detailedFeedbackPrompt.js';
import { openChatWithFeedback } from '../handlers/chatHandler.js';

// Listener for getDetailedFeedback messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getDetailedFeedback') {
        getDetailedFeedback(message.fileName)
            .then((feedback) => sendResponse({ detailedFeedback: feedback }))
            .catch((error) => {
                console.error('Error in getDetailedFeedback:', error);
                sendResponse({ error: 'Failed to get detailed feedback' });
            });
        return true; // Indicates that the response is sent asynchronously
    }
});

// Function to get detailed feedback
export async function getDetailedFeedback(fileName) {
    try {
        const data = await getFromStorage(['extractedData', 'prResults', 'detailedFeedback']);
        const extractedData = data.extractedData || [];
        const prResults = data.prResults || [];
        const detailedFeedbacks = data.detailedFeedback || {};

        // Check if detailed feedback already exists
        if (detailedFeedbacks[fileName]) {
            console.log(`Retrieving stored detailed feedback for ${fileName}`);
            return detailedFeedbacks[fileName];
        }

        const fileData = extractedData.find((file) => file.fileName === fileName || file.fileName === fileName.replace(/\\/g, ''));
        const initialFeedback = prResults.find((result) => result.fileName === fileName);

        if (!fileData) throw new Error('File data not found.');

        // Create the detailed review prompt
        const prompt = createDetailedFeedbackPrompt(fileName, fileData, initialFeedback);

        // Get the detailed feedback from OpenAI
        const detailedFeedback = await fetchDetailedFeedbackFromOpenAI(prompt);

        // Store the detailed feedback and return
        detailedFeedbacks[fileName] = detailedFeedback;
        await setInStorage('detailedFeedback', detailedFeedbacks);
        return detailedFeedback;
    } catch (error) {
        console.error('Error fetching detailed feedback:', error);
        throw new Error('Failed to get detailed feedback.');
    }
}


// Helper function to fetch detailed feedback from OpenAI
async function fetchDetailedFeedbackFromOpenAI(prompt) {
    try {
        const apiKey = await getApiKey();
        const model = await getModel();
        if (!apiKey) throw new Error('OpenAI API key not found.');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: 'You are an expert code reviewer with in-depth knowledge of software development best practices, security considerations, and performance optimization. Your role is to provide detailed, actionable feedback on the provided code changes.' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 1000,
                temperature: 0.2,
            }),
        });

        const data = await response.json();
        if (data.error) throw new Error(`OpenAI API Error: ${data.error.message}`);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching detailed feedback from OpenAI:', error);
        throw new Error('Failed to fetch detailed feedback from OpenAI.');
    }
}

export async function fetchAndDisplayDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    try {
        console.log(`Fetching and displaying detailed feedback for: ${fileName}`);

        // Set initial loading state
        detailedFeedbackDiv.style.display = 'block';
        detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading detailed feedback...</div>';

        // Retrieve extractedData and detailedFeedback from storage
        console.log('Retrieving extractedData and detailedFeedback from storage...');
        const storageData = await getFromStorage(['extractedData', 'detailedFeedback']);

        // Debug: Log the entire storage data object
        console.log('Full Storage Data Retrieved:', storageData);

        // Check if `detailedFeedback` exists in the storageData object, if not, initialize it
        const extractedData = storageData.extractedData || [];
        let detailedFeedback = storageData.detailedFeedback || {};

        // Log the retrieved values for debugging purposes
        console.log('Retrieved extractedData:', extractedData);
        console.log('Retrieved detailedFeedback:', detailedFeedback);

        // Check if the file data is available
        if (!extractedData || extractedData.length === 0) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">No extracted data available. Please re-analyze the PR.</p>';
            console.error('No extractedData found in storage.');
            return;
        }

        // Find the file data for the given fileName
        const fileData = extractedData.find(file => file.fileName === fileName);
        if (!fileData) {
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            console.error('File data not found for:', fileName);
            return;
        }

        // Destructure the file data for detailed feedback display
        const { oldCode, newCode, fullContent } = fileData;
        console.log('Found file data:', fileData);

        // Check if detailed feedback already exists for this file in storage
        if (detailedFeedback && detailedFeedback[fileName]) {
            console.log(`Using cached detailed feedback for ${fileName}`);
            displayDetailedFeedback(fileName, detailedFeedback[fileName], oldCode, newCode, fullContent, detailedFeedbackDiv, button);
        } else {
            // No detailed feedback found, generate it using OpenAI API
            console.log(`Fetching detailed feedback for ${fileName} from OpenAI...`);
            const detailedFeedbackResponse = await getDetailedFeedback(fileName);

            // Update storage with the new detailed feedback
            console.log(`Storing detailed feedback for ${fileName} in local storage.`);
            detailedFeedback[fileName] = detailedFeedbackResponse;
            await setInStorage('detailedFeedback', detailedFeedback);

            // Display the detailed feedback
            displayDetailedFeedback(fileName, detailedFeedbackResponse, oldCode, newCode, fullContent, detailedFeedbackDiv, button);
        }
    } catch (error) {
        console.error('Error fetching or displaying detailed feedback:', error);
        detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to retrieve or generate detailed feedback. Please try again later.</p>';
    }
}

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

    // **New Code: Conditional Scrolling Based on Item Index**
    // Find the parent container that holds all file-feedback items
    const resultContainer = document.getElementById('result');
    const allFileFeedbackDivs = Array.from(resultContainer.querySelectorAll('.file-feedback'));

    // Find the index of the current file-feedback div
    const currentFileFeedbackDiv = detailedFeedbackDiv.closest('.file-feedback');
    const currentIndex = allFileFeedbackDivs.indexOf(currentFileFeedbackDiv);

    // Define how many top items need special scroll handling (e.g., first 2)
    const topItemThreshold = 2;

    if (currentIndex !== -1 && currentIndex < topItemThreshold) {
        // If the item is among the first few, apply scroll offset

        // Calculate the header height
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;

        // Calculate the position of the detailedFeedbackDiv relative to the document
        const elementPosition = detailedFeedbackDiv.getBoundingClientRect().top + window.pageYOffset;

        // Scroll to the element's position minus the header height
        window.scrollTo({
            top: elementPosition - headerHeight - 10, // Additional offset for better visibility
            behavior: 'smooth'
        });
    } else {
        // For other items, use standard scrollIntoView
        detailedFeedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

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

function refreshDetailedFeedback(fileName, detailedFeedbackDiv, button) {
    detailedFeedbackDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Refreshing detailed feedback...</div>';

    chrome.storage.local.get(['detailedFeedback', 'extractedData'], (data) => {
        console.log("Full data from storage:", data);
        console.log("Searching for fileName:", fileName);

        if (!data.extractedData || !Array.isArray(data.extractedData)) {
            console.log("extractedData is not an array or is undefined:", data.extractedData);
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        console.log("extractedData array:", data.extractedData);

        const matchingFile = data.extractedData.find(file => {
            console.log("Comparing:", file.fileName, "with", fileName);
            console.log("Stripped comparison:", file.fileName, "with", fileName.replace(/\\/g, ''));
            return file.fileName === fileName || file.fileName === fileName.replace(/\\/g, '');
        });

        if (!matchingFile) {
            console.log("No matching file found");
            detailedFeedbackDiv.innerHTML = '<p class="error-message">File data not found. Please re-analyze the PR.</p>';
            return;
        }

        console.log("Matching file found:", matchingFile);

        if (data.detailedFeedback) {
            delete data.detailedFeedback[fileName];
            chrome.storage.local.set({ detailedFeedback: data.detailedFeedback }, () => {
                console.log('Removed existing detailed feedback for:', fileName);
            });
        }

        chrome.runtime.sendMessage({ action: 'getDetailedFeedback', fileName: fileName }, (response) => {
            if (response && response.detailedFeedback) {
                displayDetailedFeedback(
                    fileName,
                    response.detailedFeedback,
                    matchingFile.oldCode,
                    matchingFile.newCode,
                    matchingFile.fullContent,
                    detailedFeedbackDiv,
                    button
                );

                // Scroll detailedFeedbackDiv into view
                detailedFeedbackDiv.scrollIntoView({ behavior: 'smooth' });
            } else {
                detailedFeedbackDiv.innerHTML = '<p class="error-message">Failed to load detailed feedback.</p>';
            }
        });

    });
}