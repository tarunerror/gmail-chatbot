// background/background.js

// On install: show welcome notification
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.notifications.create('install-notification', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Gmail AI Chatbot Installed!',
      message: 'Click here to set up your API key and start using the assistant in Gmail.',
      priority: 2
    });
  }
});

// When user clicks the welcome notification, open the popup
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'install-notification') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup/popup.html')
    });
  }
  chrome.notifications.clear(notificationId);
});

// Toggle sidebar when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('mail.google.com')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleSidebar
    });
  }
});

// This function runs in the context of Gmail
function toggleSidebar() {
  const sidebar = document.getElementById('gmail-chatbot-sidebar');
  if (sidebar) {
    sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
  }
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkApiKey') {
    chrome.storage.local.get(['openrouter_api_key'], (result) => {
      sendResponse({ hasApiKey: !!result.openrouter_api_key });
    });
    return true; // Required to use async response
  }

  if (request.action === 'showNotification') {
    chrome.notifications.create('', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: request.title || 'Gmail AI Chatbot',
      message: request.message,
      priority: 1
    });
  }
});

// React to changes in storage and notify open Gmail tabs
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.openrouter_api_key) {
    chrome.tabs.query({ url: '*://mail.google.com/*' }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'apiKeyUpdated',
          apiKey: changes.openrouter_api_key.newValue
        }).catch(() => {
          // Content script might not be injected yet — ignore
        });
      }
    });
  }
});

// Inject content script when Gmail finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('mail.google.com')) {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }).catch(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/content.js']
      }).catch(console.error);
    });
  }
});

// Log on extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Gmail AI Chatbot background service started.');
});
