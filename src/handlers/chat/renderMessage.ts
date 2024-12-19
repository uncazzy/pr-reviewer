import { marked } from 'marked';
import hljs from 'highlight.js';
import { ChatMessage } from './chatUtils.js';

/**
 * Renders a chat message in the UI with proper styling and formatting.
 * 
 * @param message - The chat message to render
 * @param messagesContainer - The container element where messages are displayed
 */
export async function renderMessage(
    message: ChatMessage,
    messagesContainer: HTMLDivElement
): Promise<void> {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.role}-message`;

    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = `<i class="fas fa-${message.role === 'user' ? 'user' : 'code-branch'}"></i>`;

    // Create message content
    const messageContentDiv = document.createElement('div');
    messageContentDiv.className = 'message-content';
    
    // Parse markdown content
    const parsedContent = await marked.parse(message.content);
    messageContentDiv.innerHTML = parsedContent;

    // Apply syntax highlighting
    messageContentDiv.querySelectorAll('pre code').forEach((block) => {
        if (block instanceof HTMLElement) {
            hljs.highlightElement(block);
        }
    });

    // Assemble message
    if (message.role === 'user') {
        messageDiv.appendChild(messageContentDiv);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContentDiv);
    }

    messagesContainer.appendChild(messageDiv);
}
