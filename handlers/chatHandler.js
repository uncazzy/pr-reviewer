function openChatWithFeedback(feedback, fullContent, newCode, oldCode) {
    // Hide the "Analyze PR" button
    document.getElementById('analyze').style.display = 'none';

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    // Chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    // Add close ("X") button at the top right
    const closeButton = document.createElement('button');
    closeButton.className = 'close-chat';
    closeButton.innerHTML = '&times;'; // "X" symbol
    closeButton.addEventListener('click', () => {
        location.reload(); // Go back to original view
    });
    chatContainer.appendChild(closeButton);

    // Create a scrollable messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-container';
    chatContainer.appendChild(messagesContainer);

    // Placeholder message at the start
    const initialMessage = document.createElement('div');
    initialMessage.className = 'chat-message';
    initialMessage.textContent = 'Ask me more about this feedback';
    messagesContainer.appendChild(initialMessage);

    // Input and send button container
    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'chat-input-container';

    const chatInput = document.createElement('textarea');
    chatInput.className = 'chat-input';
    chatInput.placeholder = 'Ask a follow-up question...';
    chatInputContainer.appendChild(chatInput);

    const sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.textContent = 'Send';
    sendButton.addEventListener('click', () => {
        if (chatInput.value.trim() !== "") {
            // Create a new message
            const userMessage = document.createElement('div');
            userMessage.className = 'chat-message';
            userMessage.textContent = chatInput.value.trim();
            messagesContainer.appendChild(userMessage);

            // Clear input
            chatInput.value = '';

            // Automatically scroll to the bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Send message to the LLM
            sendMessageToLLM(feedback, fullContent, newCode, oldCode, userMessage.textContent);
        }
    });
    chatInputContainer.appendChild(sendButton);

    // Append input and send button container to the chat container
    chatContainer.appendChild(chatInputContainer);

    // Append chat container to result div
    resultDiv.appendChild(chatContainer);
}

function sendMessageToLLM(feedback, fullContent, newCode, oldCode, userQuestion) {
    console.log("Sending to LLM: ", { feedback, fullContent, newCode, oldCode, userQuestion });
    // Add the logic to send the data to the LLM and handle responses
}