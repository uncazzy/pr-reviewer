/**
 * Generates a detailed feedback prompt for OpenAI based on the provided file details and initial feedback.
 * 
 * @param {string} fileName - Name of the file being reviewed.
 * @param {string} fullContent - Full code from the file.
 * @param {string} prResult - Initial code review.
 * @returns {string} - The formatted prompt for OpenAI.
 */

export function createChatPrompt(fileName, fullContent, prResult) {
  return {
    role: 'user',
    content: `You are reviewing a pull request for the file: ${fileName}.
  
The review includes the **Full File Content**, showing the current state of the file with all changes applied. Annotations are as follows:
- \`+\` indicates added lines.
- \`-\` indicates deleted lines.
- Unmarked lines remain unchanged.
- Deleted lines appear in their original positions, marked with \`// Deleted line\`.

Each line includes its line number for reference.

<FULL_FILE_CONTENT_START>

\`\`\`
${fullContent}
\`\`\`

<FULL_FILE_CONTENT_END>
  
  ## Initial Feedback:
  - **Status**: ${prResult.status || 'N/A'}
  - **Issue**: ${prResult.issue || 'N/A'}
  
  ## Detailed Review Instructions:
  1. **Identify specific changes needed**: Describe any specific code changes required, based on logic, syntax, or best practices.
  2. **Explain rationale**: Provide a clear reason for each recommended change.
  3. **Illustrate with examples**: If applicable, include brief code examples to help clarify the suggested modifications.
  
  ### Important Context:
  - The "Updated Lines of Code" section contains only the specific lines changed in this pull request and **is not a standalone code block**. **Evaluate these changes within the full file context** for an accurate review.
  - **New File Note**: If no old code is provided, treat this as a new file and review it accordingly.
  
  Use markdown formatting for any code snippets, and keep all feedback actionable, concise, and easy to follow. Address the initial feedback provided, expanding as needed.`
  };
}

export function createSystemPrompt(fileName, fullContent) {

  return {
    role: 'system',
    content: `You are assisting the user in a real-time chat to provide focused, actionable code review feedback.

Your role:
- **Maintain clarity and context**: Focus strictly on the code in "${fileName}" as provided. Respond concisely, breaking down feedback into digestible parts. Use markdown for code snippets to enhance readability.
- **Handle follow-up questions**: Respond directly, keeping answers brief unless longer explanations are requested. Avoid extraneous detail or "walls of text."
- **Guide focus**: If the user strays off-topic, gently redirect them to questions about this file and its specific feedback.`
  };
}
