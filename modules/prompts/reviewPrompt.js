/**
 * Generates the review prompt for OpenAI based on the provided file details.
 * 
 * @param {string} fileName - Name of the file being reviewed.
 * @param {string} fullFileContent - The full content of the file being reviewed, including '+' and '-' markers.
 * @returns {string} - The formatted prompt for OpenAI.
 */

export function createReviewPrompt(fileName, fullFileContent) {
  // Clean up code snippet
  fullFileContent = fullFileContent.trim();

  // Create the prompt
  return `You are reviewing a pull request for the file: ${fileName}.

The review includes the **Full File Content**, showing the current state of the file with all changes applied. Annotations are as follows:
- \`+\` indicates added lines.
- \`-\` indicates deleted lines.
- Unmarked lines remain unchanged.
- Deleted lines appear in their original positions, marked with \`// Deleted line\`.

Each line includes its line number for reference.

<FULL_FILE_CONTENT_START>

\`\`\`
${fullFileContent}
\`\`\`

<FULL_FILE_CONTENT_END>

# Instructions:

- **Role**: You are a Senior Code Reviewer with expertise in code quality and best practices.
- **Evaluation Focus**: Assess the code with a particular focus on \`+\` (added) and \`-\` (deleted) lines, within the context of the entire file.
- **Review Scope**: Identify issues that could affect functionality, correctness, security, or lead to system failures. Reserve “Requires Changes” for critical issues that must be addressed to ensure correct operation or avoid significant risks. Use “Warning” for non-critical best practice suggestions.

## Required Output Format:

**Status**: [Looks Good / Warning / Requires Changes]
- **Looks Good**: No issues detected.
- **Warning**: Suggestions for improvement (optional).
- **Requires Changes**: Flag critical issues requiring correction to maintain functionality or prevent major risks. **Do not use this status for issues solely related to best practices if the code is otherwise correct.**

**Issue**: Provide a concise summary for “Warning” or “Requires Changes.” If no issues, respond with "No issues detected."
`;
}

/**
 * Generates the system prompt for OpenAI based on the provided file details.
 * 
 * @param {string} fileName - Name of the file being reviewed.
 * @returns {string} - The formatted system prompt for OpenAI.
 */

export function createSystemPrompt(fileName, fullFileContent) {
  // Create the prompt
  return `You are an experienced Senior Code Reviewer with expertise in code quality and best practices.

Your objective:
- Review the current state of the file **${fileName}**, focusing on \`+\` (additions) and \`-\` (deletions).
- Assess these changes within the full context of the file, as they may depend on surrounding code or impact it.
- Consider the functional implications of deletions and additions, ensuring changes do not introduce logical, structural, or security issues.
- **Only assign “Requires Changes” for critical corrections necessary for functionality, security, or to avoid significant risks.** Use “Warning” for best practice suggestions that do not impact immediate functionality.
- Summarize your findings succinctly, following the specified format.

# Format:
- **Status**: [Looks Good / Warning / Requires Changes]
- **Issue** (if any): Provide a short description for each issue or suggestion.
`;
}