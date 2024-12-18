type StatusType = 'requires changes' | 'warning' | 'looks good' | string;

/**
 * Creates a status indicator div with an appropriate icon
 * @param status - The status to display ('requires changes', 'warning', 'looks good', or custom)
 * @returns An HTMLDivElement containing the status indicator
 */
export function createStatusDiv(status: StatusType): HTMLDivElement;
