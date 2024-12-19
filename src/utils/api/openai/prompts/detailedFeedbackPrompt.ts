interface FileData {
    fullContent: string;
}

interface InitialFeedback {
    status?: string;
    issue?: string;
}

/**
 * Generates a detailed feedback prompt for OpenAI based on the provided file details and initial feedback.
 * 
 * @param fileName - Name of the file being reviewed.
 * @param fileData - An object containing the `fullContent` of the file.
 * @param initialFeedback - Initial feedback provided for the file.
 * @returns The formatted prompt for OpenAI.
 */
export function createDetailedFeedbackPrompt(
    fileName: string,
    fileData: FileData,
    initialFeedback: InitialFeedback | null
): string {
    const { fullContent } = fileData;

    return `
You are reviewing a pull request for the file: ${fileName}.

The review includes the **Full File Content**, showing the current state of the file with all changes applied. Annotations are as follows:
- \`+\` indicates added lines.
- Unmarked lines remain unchanged.

Each line includes its line number for reference.

<FULL_FILE_CONTENT_START>

\`\`\`
${fullContent}
\`\`\`

<FULL_FILE_CONTENT_END>

- **Initial Feedback Summary**:
  - **Status**: ${initialFeedback ? initialFeedback.status : 'N/A'}
  - **Issue**: ${initialFeedback ? initialFeedback.issue : 'N/A'}

## Detailed Review Requirements:
Provide a thorough, detailed review of the code changes, addressing the following:
1. **Specific Change Recommendations**: If any issues or improvements are identified, specify the exact changes needed.
2. **Rationale for Recommendations**: Explain why these changes are necessary to improve functionality, performance, or adherence to coding standards.
3. **Illustrative Code Examples**: Where applicable, include brief code examples to illustrate recommended changes.

## Output Requirements:
1. Keep your response focused, actionable, and easy to follow.
2. Use markdown for any code snippets or specific code suggestions.
3. Expand on the initial feedback as necessary, providing additional insights or adjustments relevant to the detailed review.
`;
}

/**
 * Creates a system prompt for the detailed feedback review.
 * 
 * @param fileName - Name of the file being reviewed.
 * @param fileData - An object containing the file data.
 * @param initialFeedback - Initial feedback provided for the file.
 * @returns The system prompt for OpenAI.
 */
export function createSystemPrompt(
    fileName: string,
    _fileData: FileData,
    _initialFeedback: InitialFeedback | null
): string {
    return `You are an expert code reviewer with in-depth knowledge of software development best practices, security considerations, and performance optimization. Your role is to provide detailed, actionable feedback on the code changes within the file "${fileName}", taking into account the initial feedback summary provided.

- **Focus**: Review the full file content to ensure consistency, correctness, and adherence to best practices.
- **Goal**: Identify actionable improvements with clear explanations, ensuring feedback is relevant, constructive, and implementable.`;
}