/**
 * Generates the review prompt for OpenAI based on the provided file details.
 * 
 * @param fileName - Name of the file being reviewed.
 * @param fullFileContent - The full content of the file being reviewed, including '+' and '-' markers.
 * @returns The formatted prompt for OpenAI.
 */
export function createReviewPrompt(
    fileName: string,
    fullFileContent: string
): string {
    // Clean up code snippet
    fullFileContent = fullFileContent.trim();

    // Create the prompt
    return `You are reviewing a pull request for the file: ${fileName}.

The review includes the **Full File Content**, showing the current state of the file with all changes applied. Annotations are as follows:
- \`+\` indicates added or changed lines.
- Unmarked lines remain unchanged.

Each line includes its line number for reference.

<FULL_FILE_CONTENT_START>

\`\`\`
${fullFileContent}
\`\`\`

<FULL_FILE_CONTENT_END>

# Review Instructions

You are a Senior Code Reviewer with expertise in code quality and best practices. Your task is to:

1. **Analyze Changes**: Focus on lines marked with \`+\`, understanding their purpose and impact.
2. **Review Context**: Evaluate how these changes integrate with the existing codebase.
3. **Assess Impact**: Consider:
   - Functionality: Do the changes work as intended?
   - Security: Are there any security implications?
   - Performance: Could these changes impact performance?
   - Maintainability: Is the code clear and maintainable?

# Response Format

**Status**: Choose one of:
- **Looks Good**: Changes are well-implemented and raise no concerns
- **Warning**: Non-critical issues found that should be considered
- **Requires Changes**: Critical issues that must be fixed for functionality/security

**Issue**: Provide a concise one sentence summary for “Warning” or “Requires Changes.” 

If there are no issues, status should be "Looks Good" and you can respond with "No issues detected."
`;
}

/**
 * Generates the system prompt for OpenAI based on the provided file details.
 * 
 * @param fileName - Name of the file being reviewed.
 * @param fullFileContent - The full content of the file being reviewed.
 * @returns The formatted system prompt for OpenAI.
 */
export function createSystemPrompt(
    _fileName: string,
    _fullFileContent: string
): string {
    // Create the prompt
    return `You are an experienced Senior Code Reviewer with expertise in code quality and best practices.

Key Responsibilities:
- Evaluate code changes (marked with +) within the full context
- Focus on functionality, security, and maintainability
- Provide clear, actionable feedback
- Be precise in distinguishing between critical issues and improvement suggestions

Remember:
- "Requires Changes" = Critical issues only (bugs, security, major problems)
- "Warning" = Best practices, optimizations, style improvements
- "Looks Good" = Code is functionally sound and well-implemented
`;
}