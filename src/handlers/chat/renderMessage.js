import { marked } from 'marked';
import hljs from 'highlight.js';

export function renderMessage(message, messagesContainer) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.role}-message`;

    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = `<i class="fas fa-${message.role === 'user' ? 'user' : 'code-branch'}"></i>`;

    // Create message content
    const messageContentDiv = document.createElement('div');
    messageContentDiv.className = 'message-content';
    messageContentDiv.innerHTML = marked.parse(message.content);

    // Apply syntax highlighting
    messageContentDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
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
