export async function executeContentScript(tabId) {
  // Inject the content script
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['dist/contentScript.bundle.js'],
  });
}