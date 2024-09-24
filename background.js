// Store extractedData globally
let extractedData = [];

// Listener for messages from contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.files) {
        console.log('Received files in background.js:', message.files);
        extractedData = message.files; // Store for later use

        // Save extractedData to local storage
        chrome.storage.local.set({ 'extractedData': extractedData }, () => {
            console.log('Extracted data saved to local storage');
        });

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

// Helper function to retry with exponential backoff
async function retryWithBackoff(fn, retries = 3, delay = 500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt < retries) {
                console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error; // Rethrow the error after max retries
            }
        }
    }
}

// Function to send a code review request to OpenAI
async function analyzeCodeWithGPT(fileName, oldCode, newCode, fullFileContent) {
    console.log(`Analyzing file: ${fileName}`);

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

## Old Lines of Code (if applicable):
\`\`\`
${oldCode ? oldCode : 'No previous code; this is a new file.'}
\`\`\`

## Updated Lines of Code:
\`\`\`
${newCode}
\`\`\`

Important: The "Updated Lines of Code" section represents only the specific lines that have been changed or added in this pull request. These lines are **not meant to be a complete code block** on their own. You must evaluate these updated lines **in the context of the entire file**, as shown in the "Full File Content" section. The updated lines may appear incomplete when viewed in isolation, but they should be considered within the full code structure.

Do not assess the updated lines of code in isolation. Always evaluate them in the full context of the entire file.

Considering the full file context and the specific changes, provide a quick review in the following format:
- **Status**: [Looks Good / Requires Changes]
- **Issue**: [If status is "Requires Changes", provide a brief one-sentence description of the main issue. Otherwise reply with "No issues detected"]

Do not provide any additional details or explanations. Keep the response concise and strictly in the format specified.
`;

    console.log('Prompt being sent to OpenAI:', prompt);

    const apiCall = async () => {
        // Retrieve API key & model from storage
        const apiKey = await getApiKey();
        const model = await getModel()
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
                model: model,
                messages: [
                    { role: 'system', content: 'You are an expert code reviewer with advanced knowledge of software development practices. You excel in identifying potential issues, inefficiencies, and improvements in pull requests. Your feedback should be concise, constructive, and focused on logic, performance, maintainability, and security. Always prioritize code readability, best practices, and future scalability in your reviews. Provide clear, actionable insights while ensuring the changes align with the overall project context.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1500,
                temperature: 0.2
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(`OpenAI API Error: ${data.error.message}`);
        }
        return data.choices[0].message.content;
    };

    // Retry the API call with exponential backoff
    return retryWithBackoff(apiCall);
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

// Function to retrieve OpenAI model from storage
function getModel() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('openaiModel', (data) => {
            if (data.openaiModel) {
                resolve(data.openaiModel);
            } else {
                reject('OpenAI model not found.');
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

// Listener for getDetailedFeedback messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getDetailedFeedback') {
        getDetailedFeedback(message.fileName)
            .then(feedback => {
                sendResponse({ detailedFeedback: feedback });
            })
            .catch(error => {
                console.error('Error in getDetailedFeedback:', error);
                sendResponse({ error: 'Failed to get detailed feedback' });
            });
        return true; // Indicates that the response is sent asynchronously
    }
});

// Function to get detailed feedback
async function getDetailedFeedback(fileName) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['extractedData', 'prResults'], async (data) => {
            const extractedData = data.extractedData || [];
            const prResults = data.prResults || [];
            
            const fileData = extractedData.find(file => 
                file.fileName === fileName || file.fileName === fileName.replace(/\\/g, '')
            );
            const initialFeedback = prResults.find(result => result.fileName === fileName);
            
            if (!fileData) {
                reject('File data not found.');
                return;
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

## Old Lines of Code (if applicable):
\`\`\`
${oldCode ? oldCode : 'No previous code; this is a new file.'}
\`\`\`

## Updated Lines of Code:
\`\`\`
${newCode}
\`\`\`

## Initial Feedback:
Status: ${initialFeedback ? initialFeedback.status : 'N/A'}
Issue: ${initialFeedback ? initialFeedback.issue : 'N/A'}

Provide a detailed review of the changes, focusing on the following:
1. What specific changes are needed (if any)?
2. Why are these changes necessary?
3. If applicable, provide brief code examples to illustrate the suggested changes.

Important: The "Updated Lines of Code" section represents only the specific lines that have been changed or added in this pull request. These lines are **not meant to be a complete code block** on their own. You must evaluate these updated lines **in the context of the entire file**, as shown in the "Full File Content" section. The updated lines may appear incomplete when viewed in isolation, but they should be considered within the full code structure.

Do not assess the updated lines of code in isolation. Always evaluate them in the full context of the entire file.

If no old code is provided, assume this is a new file and review accordingly.

Consider the initial feedback provided and expand upon it if relevant. If the initial feedback suggests issues, address them in your detailed review.

Keep your response concise and to the point. Use markdown formatting for code snippets, and ensure all feedback is actionable and easy to follow.`;

            console.log('Detailed prompt being sent to OpenAI:', prompt);

            try {
                // Retrieve API key & model from storage
                const apiKey = await getApiKey();
                const model = await getModel();
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
                        model: model,
                        messages: [
                            { role: 'system', content: 'You are an expert code reviewer with in-depth knowledge of software development best practices, security considerations, and performance optimization. Your role is to provide detailed, actionable feedback on the provided code changes. Your review should focus on identifying potential issues, suggesting improvements, and providing clear explanations with examples where necessary. Use concise language and format your response in markdown, especially for any code snippets, ensuring your feedback is easy to follow and implement.' },
                            { role: 'user', content: prompt }
                        ],
                        max_tokens: 1000,
                        temperature: 0.2
                    })
                });

                const data = await response.json();
                if (data.error) {
                    console.error('OpenAI API error:', data.error);
                    reject(`Error from OpenAI: ${data.error.message}`);
                } else {
                    resolve(data.choices[0].message.content);
                }
            } catch (error) {
                console.error('Error fetching detailed feedback from OpenAI:', error);
                reject('Error fetching detailed feedback from OpenAI.');
            }
        });
    });
}
