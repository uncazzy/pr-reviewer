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

## Review Content
- **Full File Content** (entire codebase for context):
\`\`\`
${fullContent.trim()}
\`\`\`

- **Old Code Snippet (if available)**:
\`\`\`
${oldCode ? oldCode.trim() : 'No previous code; this is a new file.'}
\`\`\`

- **Updated Lines of Code** (new changes only):
\`\`\`
${newCode.trim()}
\`\`\`

- **Initial Feedback Summary**:
  - **Status**: ${initialFeedback ? initialFeedback.status : 'N/A'}
  - **Issue**: ${initialFeedback ? initialFeedback.issue : 'N/A'}

## Detailed Review Requirements:
Provide a thorough, detailed review of the code changes, addressing the following:
1. **Specific Change Recommendations**: If any issues or improvements are identified, specify the exact changes needed.
2. **Rationale for Recommendations**: Explain why these changes are necessary to improve functionality, performance, or adherence to coding standards.
3. **Illustrative Code Examples**: Where applicable, include brief code examples to illustrate recommended changes.

## Important Context:
- **Evaluation Focus**: The "Updated Lines of Code" section shows only specific lines changed or added in this pull request and **is not a standalone code block**. **Always assess these updated lines within the full file context** to understand how they integrate within the overall structure.
- **If No Old Code**: If no old code is provided, consider this as a new file and review accordingly.

## Output Requirements:
1. Keep your response focused, actionable, and easy to follow.
2. Use markdown for any code snippets or specific code suggestions.
3. Expand on the initial feedback as necessary, providing additional insights or adjustments relevant to the detailed review.
`;
}

export function createSystemPrompt(fileName, fileData, initialFeedback) {
  return `You are an expert code reviewer with in-depth knowledge of software development best practices, security considerations, and performance optimization. Your role is to provide detailed, actionable feedback on the code changes within the file "${fileName}", taking into account the initial feedback summary provided.

- **Focus**: Review the updated lines of code within the full file content to ensure consistency, correctness, and adherence to best practices. Avoid evaluating the updated code lines in isolation, as they may appear incomplete without full context.
- **Goal**: Identify actionable improvements with clear explanations, ensuring feedback is relevant, concise, and structured for easy implementation.
`;
}