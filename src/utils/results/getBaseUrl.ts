export function getBaseUrl(url: string): string {
    if (!url) {
        throw new Error('URL cannot be empty');
    }

    const parts = url.split('/pull/');
    if (parts.length !== 2) {
        throw new Error('Invalid pull request URL format');
    }

    const [beforePull, pullAndAfter] = parts;
    const pullNumber = pullAndAfter.split('/')[0];
    
    if (!pullNumber) {
        throw new Error('Could not extract pull request number');
    }

    return `${beforePull}/pull/${pullNumber}`;
}
