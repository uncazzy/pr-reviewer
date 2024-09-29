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
        renderExistingMessages(fileName, messagesContainer, chatMessages.value);

        // Setup input container with the messagesContainer
        setupChatInput(chatContainer, messagesContainer, fileName, feedback, fullContent, newCode, oldCode);
    });
}

// Create chat container, header, and messages container elements
function createChatContainer(fileName) {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-container';

    // Create chat header first
    const chatHeader = createChatHeader(fileName, messagesContainer);


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
    closeButton.title = "Close chat"
    chatHeaderButtons.appendChild(closeButton);

    // Clear Chat History button
    const newChatButton = createButton('new-chat-button', '<i class="fa-solid fa-rotate-right"></i>', () => clearChatHistory(fileName, messagesContainer));
    newChatButton.title = "Start new chat"
    chatHeaderButtons.appendChild(newChatButton);

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
    sendButton.title = "Send message"
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
function renderExistingMessages(fileName, messagesContainer, messages) {
    if (messages.length === 0) {
        // Render the welcome message
        const welcomeMessage = {
            role: 'assistant',
            content: `<p><strong>Hello!</strong> I'm here to help you with the code changes in <strong>${fileName}</strong>. Feel free to ask any questions or request further explanations about the code review.</p>`,
        };
        renderMessage(welcomeMessage, messagesContainer);
    } else {
        messages.forEach((message) => renderMessage(message, messagesContainer));
    }
    // Scroll to the bottom of the messages container
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}