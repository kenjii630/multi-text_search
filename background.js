// background.js
// This script runs in the background and manages interactions between components

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.executeScript(tab.id, { file: "popup.js" });
});
