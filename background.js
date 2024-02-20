// background.js
// This script runs in the background and manages interactions between components

// Listen for clicks on the browser action icon
// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["popup.js"],
//   });
// });

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.executeScript(tab.id, { file: "popup.js" });
});
