import { createFileFeedback } from "../../utils/uiComponents.js"

// Function to check for existing PR results in storage and display them
export function checkForResults(currentUrl, resultDiv) {
    const baseUrl = currentUrl.split('/pull/')[0] + "/pull/" + currentUrl.split('/pull/')[1].split('/')[0];

    chrome.storage.local.get(['prResults', 'prUrl'], (data) => {
        if (data.prUrl) {
            const savedBaseUrl = data.prUrl.split('/pull/')[0] + "/pull/" + data.prUrl.split('/pull/')[1].split('/')[0];

            if (data.prResults && baseUrl === savedBaseUrl) {
                // Display stored results if they match the current PR
                displaySavedResults(data.prResults, resultDiv);
            } else {
                console.log('No saved results for this PR.');
                resultDiv.style.display = 'none';
            }
        } else {
            console.log('No saved prUrl found.');
            resultDiv.style.display = 'none';
        }
    });
}

// Function to display saved results in the popup
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