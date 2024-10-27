export function parseFeedback(feedback) {
  const statusMatch = feedback.match(/\*\*Status\*\*: (.*)/i);
  const issueMatch = feedback.match(/\*\*Issue\*\*: (.*)/i);

  return {
    status: statusMatch ? statusMatch[1].trim() : 'Error analyzing file',
    issue: issueMatch ? issueMatch[1].trim() : '',
  };
}