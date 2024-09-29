import { createFileFeedback } from '../../components/index.js';

export function displaySavedResults(results, resultDiv) {
  if (!resultDiv) {
    console.error('resultDiv is not defined');
    return;
  }

  if (!Array.isArray(results) || results.length === 0) {
    console.log('Results are empty or not an array:', results);
    resultDiv.style.display = 'none';
    return;
  }

  resultDiv.innerHTML = ''; // Clear any previous results
  results.sort((a, b) => a.index - b.index);
  results.forEach((result) => {
    createFileFeedback(result, resultDiv);
  });
  resultDiv.style.display = 'block';
}
