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

This review includes:
1. **Full File Context** - The complete file content for understanding the placement and impact of changes.
2. **Old Code Snippet** - Displays the lines of code as they were before the recent update (if applicable).
3. **Updated Lines of Code** - Shows only the specific lines added or modified in this pull request. **Do not evaluate these in isolation, as they are incomplete without the full file context.**

Each section below includes line numbers where the code appears.

<FULL_FILE_CONTENT_START>

\`\`\`
${fullFileContent}
\`\`\`

<FULL_FILE_CONTENT_END>

<OLD_CODE_START>

${oldCode || 'No previous code; this is a new file.'}

<OLD_CODE_END>

<UPDATED_CODE_START> 
**[# Important: This block shows only the lines that were modified. These are out of context and incomplete on their own. Evaluate within the full file context.]**

\`\`\`
${newCode}
\`\`\`

<UPDATED_CODE_END>

# Instructions:

- **Role**: Act as a Senior Code Reviewer with expertise in best practices and error detection.
- **Evaluation Context**: Assess the updated lines of code within the entire file context. **Avoid assessing changes in isolation** as these lines rely on the surrounding code for full functionality.
- **Review Scope**: Check for critical issues that could affect functionality, cause incorrect outputs, or lead to system errors. Only mark issues as “Requires Changes” if they must be fixed for the code to function correctly or to avoid significant risks. For all other comments, use “Warning.”

## Required Output Format:

**Status**: [Looks Good / Warning / Requires Changes]
- **Looks Good**: Code meets all requirements without issues.
- **Warning**: Suggest improvements or best practices (optional).
- **Requires Changes**: Flag only critical issues that could affect code functionality or introduce major risks. **Avoid marking issues based solely on best practices if the code is correct and functional.**

**Issue**: Provide a brief summary of issues if status is “Warning” or “Requires Changes.” If no issues, reply with "No issues detected."
`;
}

export function createSystemPrompt(fileName, oldCode, newCode, fullFileContent) {
  // Clean up code snippets
  oldCode = oldCode.trim();
  newCode = newCode.trim();
  fullFileContent = fullFileContent.trim();

  // Create the prompt
  return `You are an experienced Senior Code Reviewer, with expertise in code quality and best practices.

Your objective:
- Focus on reviewing "Updated Lines of Code" within the full file context, as the new lines alone may appear incomplete.
- Flag any logical, structural, or standards-related issues. Mark each as either "Requires Changes" (critical issues), "Warning" (optional improvements), or "Looks Good" if no problems are found.
- **Only assign “Requires Changes” for essential corrections needed to ensure correct functionality or to avoid significant risks.** Use “Warning” for best practice suggestions that do not affect immediate functionality.
- Summarize your findings succinctly, following the specified output format.

# Format:
- **Status**: [Looks Good / Warning / Requires Changes]
- **Issue** (if any): Short description for each warning or required change.
`;
}