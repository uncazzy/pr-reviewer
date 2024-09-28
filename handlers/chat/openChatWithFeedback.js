import { renderMessage } from "../../helpers/renderMessage.js";
import { clearChatHistory } from './clearChatHistory.js';
import { handleUserMessage } from './handleUserMessage.js';
import { chatMessages } from './chatUtils.js'; // Import shared messages array

export function openChatWithFeedback(fileName, feedback, fullContent, newCode, oldCode) {
    chrome.storage.local.get(['chatHistory'], (data) => {
        chatMessages.value = data.chatHistory && data.chatHistory[fileName] ? data.chatHistory[fileName] : [];

        document.getElementById('analyze').style.display = 'none';
        document.getElementById('settings-button').style.display = 'none';

        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // Clear existing content

        // Create chat container and retrieve messagesContainer for further use
        const { chatContainer, messagesContainer } = createChatContainer(fileName);

        resultDiv.appendChild(chatContainer);

        // Render existing messages in the messagesContainer
        renderExistingMessages(messagesContainer, chatMessages.value);

        // Setup input container with the messagesContainer
        setupChatInput(chatContainer, messagesContainer, fileName, feedback, fullContent, newCode, oldCode);
    });
}

// Create chat container, header, and messages container elements
function createChatContainer(fileName) {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    // Create chat header first
    const chatHeader = createChatHeader(fileName);

    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-container';

    // Append chatHeader first
    chatContainer.appendChild(chatHeader);

    // Append messagesContainer after chatHeader
    chatContainer.appendChild(messagesContainer);

    return { chatContainer, messagesContainer };
}

// Updated chat header creation function with messagesContainer as parameter
function createChatHeader(fileName, messagesContainer) {
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';

    // Create a container for the file name and buttons, to group them together
    const headerContentContainer = document.createElement('div');
    headerContentContainer.className = 'header-content-container';
    chatHeader.appendChild(headerContentContainer);

    // File name display (aligned to the left)
    const fileNameDisplay = document.createElement('div');
    fileNameDisplay.className = 'chat-file-name';
    fileNameDisplay.innerHTML = `Chatting about: <strong>${fileName}</strong>`;
    headerContentContainer.appendChild(fileNameDisplay);

    // Container for the buttons (aligned to the right)
    const chatHeaderButtons = document.createElement('div');
    chatHeaderButtons.className = 'chat-header-buttons';

    // Close button
    const closeButton = createButton('close-chat', '<i class="fas fa-times"></i>', () => location.reload());
    chatHeaderButtons.appendChild(closeButton);

    // Clear Chat History button
    const clearChatButton = createButton('clear-chat-button', '<i class="fas fa-trash-alt"></i>', () => clearChatHistory(fileName, messagesContainer));
    chatHeaderButtons.appendChild(clearChatButton);

    // Append the buttons container to the header
    headerContentContainer.appendChild(chatHeaderButtons);

    return chatHeader;
}


// Setup chat input and button with messagesContainer reference
function setupChatInput(chatContainer, messagesContainer, fileName, feedback, fullContent, newCode, oldCode) {
    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'chat-input-container';

    const chatInput = document.createElement('textarea');
    chatInput.className = 'chat-input';
    chatInput.placeholder = 'Ask a follow-up question...';
    chatInputContainer.appendChild(chatInput);

    const sendButton = createButton('send-button', '<i class="fas fa-paper-plane"></i>', () => {
        if (chatInput.value.trim() !== "") {
            handleUserMessage(chatInput.value.trim(), fileName, feedback, fullContent, newCode, oldCode, messagesContainer);
            chatInput.value = '';
        }
    });
    chatInputContainer.appendChild(sendButton);

    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (chatInput.value.trim() !== "") {
                handleUserMessage(chatInput.value.trim(), fileName, feedback, fullContent, newCode, oldCode, messagesContainer);
                chatInput.value = '';
            }
        }
    });

    chatContainer.appendChild(chatInputContainer);
}

// Create a reusable button element
function createButton(className, innerHTML, onClick) {
    const button = document.createElement('button');
    button.className = className;
    button.innerHTML = innerHTML;
    button.addEventListener('click', onClick);
    return button;
}

// Render existing messages in the UI
function renderExistingMessages(messagesContainer, messages) {
    messages.forEach((message) => renderMessage(message, messagesContainer));
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
