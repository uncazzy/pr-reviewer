/**
 * Interface for parsed feedback result
 */
interface ParsedFeedback {
    status: string;
    issue: string;
}

/**
 * Parses feedback from OpenAI's response to extract status and issue
 * @param feedback - Raw feedback string from OpenAI containing markdown-formatted status and issue
 * @returns Object containing parsed status and issue
 */
export function parseFeedback(feedback: string): ParsedFeedback {
    // Default values in case parsing fails
    const defaultResult: ParsedFeedback = {
        status: 'Error analyzing file',
        issue: ''
    };

    try {
        if (!feedback) {
            return defaultResult;
        }

        // Extract status and issue using regex
        const statusMatch = feedback.match(/\*\*Status\*\*: (.*?)(?:\r?\n|$)/i);
        const issueMatch = feedback.match(/\*\*Issue\*\*: (.*?)(?:\r?\n|$)/i);

        return {
            status: statusMatch?.[1]?.trim() || defaultResult.status,
            issue: issueMatch?.[1]?.trim() || defaultResult.issue
        };
    } catch (error) {
        console.error('Error parsing feedback:', error);
        return defaultResult;
    }
}