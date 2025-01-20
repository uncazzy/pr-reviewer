import { renderMessage } from './renderMessage.ts';
import { clearChatHistory } from './clearChatHistory.ts';
import { handleUserMessage } from './handleUserMessage.ts';
import { chatMessages, ChatMessage } from './chatUtils.ts';
import { createButton } from '../../utils/ui/createButton.ts';

interface ChatContainer {
    chatContainer: HTMLDivElement;
    messagesContainer: HTMLDivElement;
}

interface ChatHistory {
    [fileName: string]: ChatMessage[];
}

interface StorageData {
    chatHistory?: ChatHistory;
}

/**
 * Opens a chat interface with the context of a file's feedback
 * @param fileName - The name of the file being discussed
 * @param feedback - The feedback content for the file
 * @param fullContent - The full content of the file
 */
export function openChatWithFeedback(
    fileName: string,
    feedback: string,
    fullContent: string[]
): void {
    chrome.storage.local.get(['chatHistory'], (data: StorageData) => {
        chatMessages.length = 0; // Clear the array
        const storedMessages = data.chatHistory && data.chatHistory[fileName] ? data.chatHistory[fileName] : [];
        chatMessages.push(...storedMessages);

        const analyzeElement = document.getElementById('analyze');
        const reanalyzeElement = document.getElementById('reanalyze');
        const settingsButton = document.getElementById('settings-button');
        const resultDiv = document.getElementById('result');

        if (!analyzeElement || !reanalyzeElement || !settingsButton || !resultDiv) {
            console.error('Required elements not found');
            return;
        }

        analyzeElement.style.display = 'none';
        reanalyzeElement.style.display = 'none';
        settingsButton.style.display = 'none';
        resultDiv.innerHTML = ''; // Clear existing content

        // Create chat container and retrieve messagesContainer for further use
        const { chatContainer, messagesContainer } = createChatContainer(fileName);

        resultDiv.appendChild(chatContainer);

        // Render existing messages in the messagesContainer
        renderExistingMessages(fileName, messagesContainer, chatMessages);

        // Setup input container with the messagesContainer
        setupChatInput(chatContainer, messagesContainer, fileName, feedback, fullContent);
    });
}

/**
 * Creates a chat container and returns it along with the messages container
 * @param fileName - The name of the file being discussed
 * @returns An object containing the chat container and messages container
 */
function createChatContainer(fileName: string): ChatContainer {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-container';

    const header = createChatHeader(fileName, messagesContainer);
    chatContainer.appendChild(header);
    chatContainer.appendChild(messagesContainer);

    return { chatContainer, messagesContainer };
}

/**
 * Creates a chat header with the file name and buttons
 * @param fileName - The name of the file being discussed
 * @param messagesContainer - The container for the chat messages
 * @returns The chat header element
 */
function createChatHeader(fileName: string, messagesContainer: HTMLDivElement): HTMLDivElement {
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';

    const headerContentContainer = document.createElement('div');
    headerContentContainer.className = 'header-content-container';
    chatHeader.appendChild(headerContentContainer);

    const fileNameDisplay = document.createElement('div');
    fileNameDisplay.className = 'chat-file-name';
    fileNameDisplay.style.maxWidth = '400px';
    fileNameDisplay.style.overflow = 'hidden';
    fileNameDisplay.style.textOverflow = 'ellipsis';
    fileNameDisplay.style.whiteSpace = 'nowrap';
    fileNameDisplay.style.fontSize = '0.9em';
    fileNameDisplay.style.color = '#666666';
    fileNameDisplay.title = fileName;
    const formattedFileName = formatFilePath(fileName);
    fileNameDisplay.innerHTML = `<span style="color: #888888;">Chatting about:</span> <strong>${formattedFileName}</strong>`;
    headerContentContainer.appendChild(fileNameDisplay);

    const chatHeaderButtons = document.createElement('div');
    chatHeaderButtons.className = 'chat-header-buttons';

    const closeButton = createButton(
        'close-chat',
        '<i class="fas fa-times"></i>',
        () => location.reload()
    );
    closeButton.title = 'Close chat';
    chatHeaderButtons.appendChild(closeButton);

    const newChatButton = createButton(
        'new-chat-button',
        '<i class="fa-solid fa-rotate-right"></i>',
        () => clearChatHistory(fileName, messagesContainer)
    );
    newChatButton.title = 'Start new chat';
    chatHeaderButtons.appendChild(newChatButton);

    headerContentContainer.appendChild(chatHeaderButtons);

    return chatHeader;
}

// Format the file path to show a shorter, more meaningful version
function formatFilePath(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.length <= 2) return filePath; // If it's just filename or single directory, show as is

    const fileName = parts[parts.length - 1];

    // If the path is long, show only filename
    if (filePath.length > 40) {
        return `.../${fileName}`;
    }

    return filePath;
}

/**
 * Sets up the chat input and button
 * @param chatContainer - The container for the chat
 * @param messagesContainer - The container for the chat messages
 * @param fileName - The name of the file being discussed
 * @param feedback - The feedback content for the file
 * @param fullContent - The full content of the file
 */
function setupChatInput(
    chatContainer: HTMLDivElement,
    messagesContainer: HTMLDivElement,
    fileName: string,
    feedback: string,
    fullContent: string[]
): void {
    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'chat-input-container';

    const chatInput = document.createElement('textarea');
    chatInput.className = 'chat-input';
    chatInput.placeholder = 'Ask a follow-up question...';
    chatInputContainer.appendChild(chatInput);

    const sendButton = createButton('send-button', '<i class="fas fa-paper-plane"></i>', () => {
        if (chatInput.value.trim() !== "") {
            handleUserMessage(chatInput.value.trim(), fileName, feedback, fullContent.join('\n'), messagesContainer);
            chatInput.value = '';
        }
    });
    sendButton.title = 'Send message';
    chatInputContainer.appendChild(sendButton);

    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (chatInput.value.trim() !== "") {
                handleUserMessage(chatInput.value.trim(), fileName, feedback, fullContent.join('\n'), messagesContainer);
                chatInput.value = '';
            }
        }
    });

    chatContainer.appendChild(chatInputContainer);
}

/**
 * Renders existing messages in the chat
 * @param fileName - The name of the file being discussed
 * @param messagesContainer - The container for the chat messages
 * @param messages - The array of chat messages
 */
function renderExistingMessages(
    fileName: string,
    messagesContainer: HTMLDivElement,
    messages: ChatMessage[]
): void {
    if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
            role: 'assistant',
            content: `<p><strong>Hello!</strong> I'm here to help you with the code changes in <strong>${fileName}</strong>. Feel free to ask any questions or request further explanations about the code review.</p>`
        };
        renderMessage(welcomeMessage, messagesContainer);
    } else {
        messages.forEach((message) => renderMessage(message, messagesContainer));
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
