import { getApiKey, getModel } from '@utils/storage';
import { chatMessages } from './chatUtils.js';
import { createChatPrompt, createSystemPrompt } from '@utils/api/openai/prompts/chatPrompt.js';
import { getBaseUrl } from '@utils/results';

export async function sendMessageToLLM(fileName, detailedFeedback, fullContent, userQuestion, messagesContainer) {
    let fileData = null;

    try {
        // Retrieve the `extractedDataByPr` and find the relevant file data using the base URL
        const baseUrl = await new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(getBaseUrl(tabs[0].url));
            });
        });

        const data = await new Promise((resolve) => chrome.storage.local.get('extractedDataByPr', resolve));
        const extractedDataByPr = data.extractedDataByPr || {};

        // Get the specific PR data using the base URL
        const prData = extractedDataByPr[baseUrl];
        if (prData && prData.extractedData && prData.extractedData.length > 0) {
            // Find the specific file data based on fileName
            fileData = prData.extractedData.find(file => file.fileName === fileName);

            if (!fileData) {
                console.warn(`No extracted data found for file: ${fileName}. Proceeding without file context.`);
            }
        } else {
            console.warn(`No extractedData found for baseUrl: ${baseUrl}. Proceeding without file context.`);
        }
    } catch (error) {
        console.error('Error retrieving extracted data from storage:', error);
    }

    // Prepare the system and initial prompts using the new prompt functions
    const systemPrompt = createSystemPrompt(fileName, fullContent);
    const initialPrompt = createChatPrompt(fileName, fullContent, fileData);

    // Prepare the messages to send to OpenAI API
    let apiMessages = []; // Messages sent to the LLM, including system and initial prompts

    // Retrieve apiMessages from storage or initialize them
    let apiMessagesHistory = {};
    let storedApiMessages = [];

    await new Promise((resolve) => {
        chrome.storage.local.get(['apiMessagesHistory'], (data) => {
            apiMessagesHistory = data.apiMessagesHistory || {};
            storedApiMessages = apiMessagesHistory[fileName] || [];
            resolve();
        });
    });

    if (storedApiMessages.length === 0) {
        // First time, initialize apiMessages
        apiMessages = [systemPrompt, initialPrompt, { role: 'assistant', content: detailedFeedback }];
    } else {
        // Use stored apiMessages
        apiMessages = storedApiMessages;
    }

    // Add the user's latest question
    apiMessages.push({ role: 'user', content: userQuestion });

    // Log the messages sent to LLM
    console.log("Sending to LLM: ", apiMessages);

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
                messages: apiMessages,
                stream: true,
                max_tokens: 1000,
                temperature: 0.2
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantMessage = '';
        let partialData = ''; // Buffer to hold incomplete JSON chunks

        // Create a new message element to show the streaming response
        const assistantMessageDiv = document.createElement('div');
        assistantMessageDiv.className = 'chat-message assistant-message';

        // Create avatar and message content
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = '<i class="fas fa-code-branch"></i>';

        const messageContentDiv = document.createElement('div');
        messageContentDiv.className = 'message-content';

        assistantMessageDiv.appendChild(avatar);
        assistantMessageDiv.appendChild(messageContentDiv);

        messagesContainer.appendChild(assistantMessageDiv);

        // Scroll to the bottom initially
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

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
                        // Buffer incomplete chunks and combine them into a complete JSON object
                        partialData += jsonData;

                        // Try parsing the buffered data
                        const parsedData = JSON.parse(partialData);
                        const delta = parsedData.choices[0].delta;

                        if (delta && delta.content) {
                            assistantMessage += delta.content;
                            messageContentDiv.innerHTML = marked.parse(assistantMessage);
                            messageContentDiv.querySelectorAll('pre code').forEach((block) => {
                                hljs.highlightElement(block);
                            });
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        }

                        // Clear partial data once successfully parsed
                        partialData = '';

                    } catch (err) {
                        // If there's a parsing error, it's likely due to incomplete JSON
                        console.warn('Incomplete or malformed JSON, awaiting more chunks...', err);
                    }
                }
            }
        }

        // Scroll to the bottom after updating the assistant's message
        assistantMessageDiv.scrollIntoView({ behavior: 'smooth' });

        // Add the assistant's response to the chat history
        chatMessages.push({ role: 'assistant', content: assistantMessage });
        apiMessages.push({ role: 'assistant', content: assistantMessage });

        // Save messages and apiMessages to storage
        chrome.storage.local.get(['chatHistory', 'apiMessagesHistory'], (data) => {
            let chatHistory = data.chatHistory || {};
            let apiMessagesHistory = data.apiMessagesHistory || {};

            chatHistory[fileName] = chatMessages;
            apiMessagesHistory[fileName] = apiMessages;

            chrome.storage.local.set({ chatHistory, apiMessagesHistory });
        });

    } catch (error) {
        console.error('Error sending message to LLM:', error);
    }
}
