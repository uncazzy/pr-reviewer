// Store extractedData globally
let extractedData = [];

// Listener for messages from contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.files) {
        console.log('Received files in background.js:', message.files);
        extractedData = message.files; // Store for later use

        processFiles(message.files);
    }
});

// Function to process files sequentially
async function processFiles(files) {
    const results = [];
    try {
        for (const file of files) {
            console.log('Analyzing file:', file.fileName);
            const feedback = await analyzeCodeWithGPT(file.fileName, file.oldCode, file.newCode, file.fullContent);

            // Parse the feedback to extract the status and issue
            const parsedFeedback = parseFeedback(feedback);

            // Collect results for saving later
            results.push({
                fileName: file.fileName,
                status: parsedFeedback.status,
                issue: parsedFeedback.issue,
                index: file.index
            });

            // Update the results in storage after each file
            chrome.storage.local.get('currentPrUrl', (data) => {
                chrome.storage.local.set({
                    'prResults': results,
                    'prUrl': data.currentPrUrl
                }, () => {
                    console.log('Results updated');
                });
            });
        }

        // After processing all files, notify that processing is complete
        chrome.storage.local.set({ 'processingComplete': true }, () => {
            console.log('Processing complete');
        });
    } catch (error) {
        console.error(error);
        // Send error message to popup
        chrome.storage.local.set({ 'error': error.message || error });
    }
}

// Function to send a code review request to OpenAI
async function analyzeCodeWithGPT(fileName, oldCode, newCode, fullFileContent) {
    console.log('Analyzing file in GPT function:', fileName);
    console.log('Full file content length:', fullFileContent.length);

    // Clean up code snippets
    oldCode = oldCode.trim();
    newCode = newCode.trim();
    fullFileContent = fullFileContent.trim();

    // Log the prompt being sent
    const prompt = `
You are reviewing a pull request for the file: ${fileName}.

## Full File Content:
\`\`\`
${fullFileContent}
\`\`\`

## Old Code Snippet:
\`\`\`
${oldCode}
\`\`\`

## New Code Snippet:
\`\`\`
${newCode}
\`\`\`

Considering the full file context and the specific changes, provide a quick review in the following format:
- **Status**: [Looks Good / Requires Changes]
- **Issue**: [If status is "Requires Changes", provide a brief one-sentence description of the main issue]

Do not provide any additional details or explanations.`;

    console.log('Prompt being sent to OpenAI:', prompt);

    try {
        // Retrieve API key from storage
        const apiKey = await getApiKey();
        if (!apiKey) {
            throw 'OpenAI API key not found.';
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are an expert code reviewer with deep knowledge of software development best practices.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1500,
                temperature: 0.2
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('OpenAI API error:', data.error);
            throw `Error from OpenAI: ${data.error.message}`;
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        throw error;
    }
}

// Function to retrieve API key from storage
function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('openaiApiKey', (data) => {
            if (data.openaiApiKey) {
                resolve(data.openaiApiKey);
            } else {
                reject('OpenAI API key not found.');
            }
        });
    });
}

// Function to parse the feedback from GPT-4
function parseFeedback(feedback) {
    const statusMatch = feedback.match(/- \*\*Status\*\*: (.*)/i);
    const issueMatch = feedback.match(/- \*\*Issue\*\*: (.*)/i);

    return {
        status: statusMatch ? statusMatch[1].trim() : 'Requires Changes',
        issue: issueMatch ? issueMatch[1].trim() : ''
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getDetailedFeedback') {
        getDetailedFeedback(message.fileName).then(feedback => {
            sendResponse({ detailedFeedback: feedback });
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

// Function to get detailed feedback
async function getDetailedFeedback(fileName) {
    const fileData = extractedData.find(file => file.fileName === fileName);
    if (!fileData) {
        return 'File data not found.';
    }

    // Clean up code snippets
    const oldCode = fileData.oldCode.trim();
    const newCode = fileData.newCode.trim();
    const fullContent = fileData.fullContent.trim();

    const prompt = `
You are reviewing a pull request for the file: ${fileName}.

## Full File Content:
\`\`\`
${fullContent}
\`\`\`

## Old Code Snippet:
\`\`\`
${oldCode}
\`\`\`

## New Code Snippet:
\`\`\`
${newCode}
\`\`\`

Provide a detailed review of the changes, focusing on:
1. What specific changes are needed (if any)?
2. Why are these changes necessary?
3. If applicable, provide brief code examples to illustrate the suggested changes.

Keep your response concise and to the point. Use appropriate markdown formatting, especially for code snippets.`;

    console.log('Detailed prompt being sent to OpenAI:', prompt);

    try {
        // Retrieve API key from storage
        const apiKey = await getApiKey();
        if (!apiKey) {
            throw 'OpenAI API key not found.';
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are an expert code reviewer providing concise, actionable feedback.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.2
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('OpenAI API error:', data.error);
            return `Error from OpenAI: ${data.error.message}`;
        }
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching detailed feedback from OpenAI:', error);
        return 'Error fetching detailed feedback from OpenAI.';
    }
}
