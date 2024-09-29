// Helper function to retry with exponential backoff
export async function retryWithBackoff(fn, retries = 3, delay = 500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt < retries) {
          console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error; // Rethrow the error after max retries
        }
      }
    }
  }