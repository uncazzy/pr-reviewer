/**
 * Generates a detailed feedback prompt for OpenAI based on the provided file details and initial feedback.
 * 
 * @param {string} fileName - Name of the file being reviewed.
 * @param {object} fileData - An object containing `oldCode`, `newCode`, and `fullContent` of the file.
 * @param {object} initialFeedback - Initial feedback provided for the file.
 * @returns {string} - The formatted prompt for OpenAI.
 */

export function createDetailedFeedbackPrompt(fileName, fileData, initialFeedback) {
  const { oldCode, newCode, fullContent } = fileData;

  return `
You are reviewing a pull request for the file: ${fileName}.

## Full File Content:
\`\`\`
${fullContent.trim()}
\`\`\`

## Old Lines of Code (if applicable):
\`\`\`
${oldCode ? oldCode.trim() : 'No previous code; this is a new file.'}
\`\`\`

## Updated Lines of Code:
\`\`\`
${newCode.trim()}
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

Keep your response concise and to the point. Use markdown formatting for code snippets, and ensure all feedback is actionable and easy to follow.
`;
}