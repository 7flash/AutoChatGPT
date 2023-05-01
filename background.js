chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'findTabByTitle') {
      const targetTitle = message.targetTitle;
      chrome.tabs.query({ title: targetTitle }, (tabs) => {
        if (tabs.length === 0) {
          sendResponse({ success: false });
        } else {
          const tabId = tabs.filter(it => it.title == targetTitle)[0].id;
          sendResponse({ success: true, tabId });
        }
      });
      return true;
    } else if (message.action === 'generateResponse') {
      handleMessageFromContentScript(message, sender, sendResponse);
      return true;
    }
  });
  
  function handleMessageFromContentScript(message, sender, sendResponse) {
    if (message.action === 'generateResponse') {
      const tabMessage = { action: 'generateResponse', prompt: message.prompt };
  
      chrome.tabs.sendMessage(message.tabId, tabMessage, (response) => {
        if (response) {
          sendResponse({ success: true, response: response });
        } else {
          sendResponse({ success: false });
        }
      });
    }
  }
  