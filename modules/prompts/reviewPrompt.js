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
  return `You are reviewing a pull request for the file: ${fileName}.

The review content includes:
1. **Full File Context** - The complete file content, providing the necessary context for understanding how the updated lines integrate within the full code structure.
2. **Old Code Snippet** - Displays lines of code as they were before the latest changes (if available).
3. **Updated Lines of Code** - Shows only the specific lines added or modified in this pull request. **These lines are not a complete code block on their own and must be reviewed in the context of the full file.**

--- Full File Content ---

${fullFileContent}

--- Old Code (if available) ---

${oldCode ? oldCode : 'No previous code; this is a new file.'}

--- Updated Code (new changes only) ---

${newCode}

# Instructions:

- **Role**: Act as a Senior Code Reviewer with expertise in identifying best practices and common errors.
- **Context**: Evaluate the updated lines of code within the full file context to ensure accuracy, completeness, and consistency. Do not assess the new lines in isolation, as they are not intended to function independently.
- **Review Scope**: Check logic, structure, and coding standards relevant to the changes made, identifying any critical issues or adjustments needed.

## Required Output Format:

**Status**: [Looks Good / Requires Changes]
**Issue**: If “Requires Changes,” provide a brief one-sentence description of the main issue. Keep it as short and concise as possible. Otherwise reply with "No issues detected.""
`;
}

export function createSystemPrompt(fileName, oldCode, newCode, fullFileContent) {
  // Clean up code snippets
  oldCode = oldCode.trim();
  newCode = newCode.trim();
  fullFileContent = fullFileContent.trim();

  // Create the prompt
  return `You are an expert Senior Code Reviewer with advanced knowledge of software development. You evaluate code changes in context, ensuring quality and adherence to best practices.

Your goal:
- Focus on the "Updated Lines of Code" within the full file context provided. **Do not assess these updated lines in isolation** since they may appear incomplete when separated from the file’s complete structure.
- Identify any issues with logic, structure, or coding standards and provide feedback accordingly.
- For efficiency, summarize findings concisely in the requested format.
`;
}

// export function createSystemPrompt(fileName, oldCode, newCode, fullFileContent) {
//   return `You are an expert Senior Code Reviewer with advanced knowledge of software development. You evaluate code changes in context, ensuring quality and adherence to best practices.

// File under review: ${fileName}

// --- Full File Content ---
// ${fullFileContent}

// # Important Instructions:
// - Focus on the "Updated Lines of Code" provided below within the full file context. **Do not assess these updated lines in isolation** since they may appear incomplete when separated from the file’s complete structure.
// - **Updated Lines of Code (new changes only)**:
// \`\`\`
// ${newCode}
// \`\`\`
// - **Old Code Snippet (if available)**:
// \`\`\`
// ${oldCode ? oldCode : 'No previous code; this is a new file.'}
// \`\`\`

// # Goal:
// Identify issues with logic, structure, or coding standards and provide feedback accordingly. For efficiency, summarize findings concisely in the requested format.

// ## Required Output Format:
// - Status: [Looks Good / Requires Changes]
// - Issue: If “Requires Changes,” briefly note the primary issue. If not, respond with "No issues detected."
// `;
// }