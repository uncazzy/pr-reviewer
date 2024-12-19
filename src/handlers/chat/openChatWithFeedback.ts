import { renderMessage } from './renderMessage.ts';
import { clearChatHistory } from './clearChatHistory.ts';
import { handleUserMessage } from './handleUserMessage.ts';
import { chatMessages, ChatMessage } from './chatUtils.ts';

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
export async function openChatWithFeedback(
    fileName: string,
    feedback: string,
    fullContent: string[]
): Promise<void> {
    chrome.storage.local.get(['chatHistory'], async (data: StorageData) => {
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
        await renderExistingMessages(fileName, messagesContainer, chatMessages);

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
    const header = document.createElement('div');
    header.className = 'chat-header';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'chat-title-container';

    const title = document.createElement('h3');
    title.textContent = `Chat about ${fileName}`;
    titleContainer.appendChild(title);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'chat-button-container';

    // Create clear button
    const clearButton = createButton(
        'clear-button',
        '<i class="fas fa-trash"></i>',
        () => clearChatHistory(fileName, messagesContainer)
    );
    clearButton.title = 'Clear chat history';

    // Create minimize button
    const minimizeButton = createButton(
        'minimize-button',
        '<i class="fas fa-minus"></i>',
        () => {
            messagesContainer.style.display = messagesContainer.style.display === 'none' ? 'block' : 'none';
        }
    );
    minimizeButton.title = 'Minimize chat';

    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(minimizeButton);

    titleContainer.appendChild(buttonContainer);
    header.appendChild(titleContainer);

    return header;
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
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const textArea = document.createElement('textarea');
    textArea.placeholder = 'Type your message here...';
    textArea.rows = 1;

    const sendButton = document.createElement('button');
    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    sendButton.title = 'Send message';

    // Handle message submission
    const submitMessage = () => {
        const messageContent = textArea.value.trim();
        if (messageContent) {
            handleUserMessage(messageContent, fileName, feedback, fullContent.join('\n'), messagesContainer);
            textArea.value = '';
            textArea.rows = 1;
        }
    };

    // Event listeners
    sendButton.addEventListener('click', submitMessage);
    textArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    });
    textArea.addEventListener('input', () => {
        textArea.rows = Math.min(5, textArea.value.split('\n').length);
    });

    inputContainer.appendChild(textArea);
    inputContainer.appendChild(sendButton);
    chatContainer.appendChild(inputContainer);
}

/**
 * Creates a button element
 * @param className - The class name for the button
 * @param innerHTML - The inner HTML for the button
 * @param onClick - The click event handler for the button
 * @returns The button element
 */
function createButton(className: string, innerHTML: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = className;
    button.innerHTML = innerHTML;
    button.addEventListener('click', onClick);
    return button;
}

/**
 * Renders existing messages in the chat
 * @param fileName - The name of the file being discussed
 * @param messagesContainer - The container for the chat messages
 * @param messages - The array of chat messages
 */
async function renderExistingMessages(
    _fileName: string,
    messagesContainer: HTMLDivElement,
    messages: ChatMessage[]
): Promise<void> {
    for (const message of messages) {
        await renderMessage(message, messagesContainer);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}