import {
    checkApiKey,
    resetUI,
    getCurrentTabUrl,
    ensureFilesTabUrl,
    executeContentScript,
  } from './index.js'
  
  export async function handleAnalyzeClick(loadingDiv, analyzeButton, resultDiv) {
    try {
      await checkApiKey();
      await resetUI(resultDiv, loadingDiv, analyzeButton);
  
      const { currentTab, currentUrl } = await getCurrentTabUrl();
      await new Promise((resolve) => {
        chrome.storage.local.set({ 'currentPrUrl': currentUrl }, resolve);
      });
  
      const updatedTab = await ensureFilesTabUrl(currentUrl, currentTab.id);
      const tabToUse = updatedTab || currentTab;
  
      await executeContentScript(tabToUse.id);
    } catch (error) {
      console.error('Error in handleAnalyzeClick:', error);
    }
  }
