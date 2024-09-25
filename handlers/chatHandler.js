function openChatWithFeedback(fileName, feedback, fullContent, newCode, oldCode) {
    // Retrieve existing chat history for this file
    chrome.storage.local.get(['chatHistory'], (data) => {
        messages = data.chatHistory && data.chatHistory[fileName] ? data.chatHistory[fileName] : [];

        // Hide the "Analyze PR" button
        document.getElementById('analyze').style.display = 'none';

        // Result div
        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'flex';
        resultDiv.style.flexDirection = 'column';
        resultDiv.style.flexGrow = '1';
        resultDiv.style.padding = 0;
        resultDiv.innerHTML = '';

        // Chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';

        // Create chat header
        const chatHeader = document.createElement('div');
        chatHeader.className = 'chat-header';

        // File name display
        const fileNameDisplay = document.createElement('div');
        fileNameDisplay.className = 'chat-file-name';
        fileNameDisplay.innerHTML = `Chatting about: <strong>${fileName}</strong>`;
        chatHeader.appendChild(fileNameDisplay);

        // Buttons container
        const chatHeaderButtons = document.createElement('div');
        chatHeaderButtons.className = 'chat-header-buttons';

        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-chat';
        closeButton.innerHTML = '<i class="fas fa-times"></i>'; // Use an icon
        closeButton.addEventListener('click', () => {
            location.reload(); // Go back to original view
        });
        chatHeaderButtons.appendChild(closeButton);

        // Clear Chat button
        const clearChatButton = document.createElement('button');
        clearChatButton.className = 'clear-chat-button';
        clearChatButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        clearChatButton.addEventListener('click', () => {
            clearChatHistory(fileName, messagesContainer);
        });
        chatHeaderButtons.appendChild(clearChatButton);

        // Append buttons container to chat header
        chatHeader.appendChild(chatHeaderButtons);

        // Append chat header to chat container
        chatContainer.appendChild(chatHeader);

        // Messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        chatContainer.appendChild(messagesContainer);

        // Append chat container to result div
        resultDiv.appendChild(chatContainer);

        // Render existing messages
        messages.forEach((message) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${message.role}-message`;
            messageDiv.innerHTML = `<i class="fas fa-${message.role === 'user' ? 'user' : 'robot'}"></i> ${marked.parse(message.content)}`;
            messagesContainer.appendChild(messageDiv);
        });

        // Scroll to the bottom after rendering messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // If there are no messages, display the initial assistant message
        if (messages.length === 0) {
            const initialMessage = document.createElement('div');
            initialMessage.className = 'chat-message assistant-message ask-feedback';
            initialMessage.innerHTML = `<i class="fas fa-robot"></i> Ask me whatever you want to know about this feedback.\n\nWhat do you want to know?`;
            messagesContainer.appendChild(initialMessage);
        }

        // Input and send button container
        const chatInputContainer = document.createElement('div');
        chatInputContainer.className = 'chat-input-container';

        const chatInput = document.createElement('textarea');
        chatInput.className = 'chat-input';
        chatInput.placeholder = 'Ask a follow-up question...';
        chatInputContainer.appendChild(chatInput);

        const sendButton = document.createElement('button');
        sendButton.className = 'send-button';
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>'; // Use an icon
        sendButton.addEventListener('click', () => {
            if (chatInput.value.trim() !== "") {
                handleUserMessage(chatInput.value.trim(), fileName, feedback, fullContent, newCode, oldCode, messagesContainer);
                chatInput.value = '';
            }
        });
        chatInputContainer.appendChild(sendButton);

        // Append input and send button container to the chat container
        chatContainer.appendChild(chatInputContainer);

        // Event listener for Enter key to send message
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (chatInput.value.trim() !== "") {
                    handleUserMessage(chatInput.value.trim(), fileName, feedback, fullContent, newCode, oldCode, messagesContainer);
                    chatInput.value = '';
                }
            }
        });
    });
}

// Helper function to handle user messages
function handleUserMessage(messageContent, fileName, feedback, fullContent, newCode, oldCode, messagesContainer) {
    // Create a new user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `<i class="fas fa-user"></i> ${marked.parse(messageContent)}`;
    messagesContainer.appendChild(userMessage);

    // Automatically scroll to the bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Send message to the LLM and render the assistant response
    sendMessageToLLM(fileName, feedback, fullContent, newCode, oldCode, messageContent, messagesContainer);
}

// Initialize messages array to keep track of all exchanges
let messages = [];

async function sendMessageToLLM(fileName, detailedFeedback, fullContent, newCode, oldCode, userQuestion, messagesContainer) {
    // First, retrieve the `prResult` from `chrome.storage.local`
    const prResult = await new Promise((resolve, reject) => {
        chrome.storage.local.get('prResults', (data) => {
            const prResults = data.prResults || [];
            const result = prResults.find(pr => pr.fileName === fileName);
            if (result) {
                resolve(result);
            } else {
                reject('No prResult found for this file.');
            }
        });
    });

    // Chat-specific system prompt
    const systemPrompt = {
        role: 'system',
        content: `You are assisting the user in a real-time chat interaction. Provide concise, focused responses. If the user asks follow-up questions, keep your answers to the point and avoid long explanations unless specifically requested. Avoid walls of text, and break down explanations into digestible parts.`
    };

    // Create the initial prompt with full context for detailed feedback
    const initialPrompt = {
        role: 'user',
        content: `
You are reviewing a pull request for the file: ${fileName}.

## Full File Content:
\`\`\`
${fullContent}
\`\`\`

## Old Lines of Code (if applicable):
\`\`\`
${oldCode ? oldCode : 'No previous code; this is a new file.'}
\`\`\`

## Updated Lines of Code:
\`\`\`
${newCode}
\`\`\`

## Initial Feedback:
Status: ${prResult.status || 'N/A'}
Issue: ${prResult.issue || 'N/A'}

Provide a detailed review of the changes, focusing on the following:
1. What specific changes are needed (if any)?
2. Why are these changes necessary?
3. If applicable, provide brief code examples to illustrate the suggested changes.

Important: The "Updated Lines of Code" section represents only the specific lines that have been changed or added in this pull request. These lines are **not meant to be a complete code block** on their own. You must evaluate these updated lines **in the context of the entire file**, as shown in the "Full File Content" section. The updated lines may appear incomplete when viewed in isolation, but they should be considered within the full code structure.

Do not assess the updated lines of code in isolation. Always evaluate them in the full context of the entire file.
`
    };

    // Add the system prompt to the messages array only once (if it’s the first interaction)
    if (messages.length === 0) {
        messages.push(systemPrompt);
    }

    // Push the initial context (feedback request and LLM's detailed feedback response)
    if (messages.length === 1) {
        // Add the initial prompt for feedback followed by the LLM's detailed feedback response
        messages.push(initialPrompt);
        messages.push({
            role: 'assistant',
            content: detailedFeedback  // This is the response from the LLM for detailed feedback
        });
    }

    // Add the user's follow-up question to the messages array
    messages.push({
        role: 'user',
        content: userQuestion
    });

    console.log("Sending to LLM: ", messages);

    try {
        // Retrieve API key & model from storage
        const apiKey = await getApiKey();
        const model = await getModel();
        if (!apiKey) {
            throw 'OpenAI API key not found.';
        }

        // Stream the response from the LLM
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: true,
                max_tokens: 1000,
                temperature: 0.2
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantMessage = '';

        // Create a new message element to show the streaming response
        const assistantMessageDiv = document.createElement('div');
        assistantMessageDiv.className = 'chat-message assistant-message';
        messagesContainer.appendChild(assistantMessageDiv);

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            // Decode the incoming chunk
            const chunk = decoder.decode(value, { stream: true });

            // Process each line of the stream, which starts with "data: "
            const lines = chunk.split("\n");
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith("data:")) {
                    const jsonData = line.substring(5).trim();  // Remove "data: "
                    if (jsonData === "[DONE]") {
                        done = true;
                        break;
                    }

                    try {
                        // Parse the JSON content
                        const parsedData = JSON.parse(jsonData);
                        const delta = parsedData.choices[0].delta;

                        if (delta && delta.content) {
                            assistantMessage += delta.content;
                            assistantMessageDiv.innerHTML = `<i class="fas fa-code-branch"></i> ${marked.parse((assistantMessage))}`;
                            assistantMessageDiv.querySelectorAll('pre code').forEach((block) => {
                                hljs.highlightElement(block);
                            });
                        }

                    } catch (err) {
                        console.error('Error parsing chunk:', err);
                    }
                }
            }
        }

        // Scroll to the bottom after updating the assistant's message
        assistantMessageDiv.scrollIntoView({ behavior: 'smooth' });

        // Add the assistant response to the messages array for continuity in future interactions
        messages.push({
            role: 'assistant',
            content: assistantMessage
        });

        // Save the updated messages array to chrome.storage.local
        chrome.storage.local.get(['chatHistory'], (data) => {
            let chatHistory = data.chatHistory || {};
            chatHistory[fileName] = messages;
            chrome.storage.local.set({ chatHistory });
        });

    } catch (error) {
        console.error('Error sending message to LLM:', error);
    }
}

function clearChatHistory(fileName, messagesContainer) {
    if (confirm('Are you sure you want to clear the chat history?')) {
        // Clear messages array
        messages = [];

        // Remove chat history from storage
        chrome.storage.local.get(['chatHistory'], (data) => {
            let chatHistory = data.chatHistory || {};
            delete chatHistory[fileName];
            chrome.storage.local.set({ chatHistory }, () => {
                // Clear the messages displayed in the UI
                messagesContainer.innerHTML = '';
                // Optionally, you can re-initialize the chat with the initial assistant message
            });
        });
    }
}