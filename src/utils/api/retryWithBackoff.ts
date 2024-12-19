/**
 * Helper function to retry an async operation with exponential backoff
 * @param fn - The async function to retry
 * @param retries - Maximum number of retry attempts (default: 3)
 * @param delay - Initial delay in milliseconds before retrying (default: 500)
 * @returns Promise resolving to the result of the function
 * @throws The last error encountered after all retries are exhausted
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 500
): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt < retries) {
                console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error; // Rethrow the error after max retries
            }
        }
    }
    // This should never be reached due to the return or throw above,
    // but TypeScript needs it for type safety
    throw new Error('Unexpected end of retryWithBackoff');
}
