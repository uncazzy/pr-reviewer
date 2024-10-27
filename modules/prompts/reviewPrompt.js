/**
 * Generates the review prompt for OpenAI based on the provided file details.
 * 
 * @param {string} fileName - Name of the file being reviewed.
 * @param {string} oldCode - The old code content (if any) before the changes.
 * @param {string} newCode - The new code content after the changes.
 * @param {string} fullFileContent - The full content of the file being reviewed.
 * @returns {string} - The formatted prompt for OpenAI.
 */

export function createReviewPrompt(fileName, oldCode, newCode, fullFileContent) {
  // Clean up code snippets
  oldCode = oldCode.trim();
  newCode = newCode.trim();
  fullFileContent = fullFileContent.trim();

  // Create the prompt
  return `
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
}

export function createSystemPrompt(fileName, oldCode, newCode, fullFileContent) {
  return `You are an expert code reviewer with advanced knowledge of software development practices.`;
}