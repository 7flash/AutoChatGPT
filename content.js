let backTabTitle = null;

async function getCompletedReadyState() {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve("completed");
    }
    document.onreadystatechange = () => {
      if (document.readyState === "complete") {
        resolve("completed");
      }
    };
  });
}

function waitElement(selector, shouldBePresent = true) {
  return new Promise((resolve) => {
    if (shouldBePresent) {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }
    } else {
      if (!document.querySelector(selector)) {
        return resolve();
      }
    }

    const observer = new MutationObserver((mutations) => {
      if (shouldBePresent) {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      } else {
        if (!document.querySelector(selector)) {
          resolve();
          observer.disconnect();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

async function waitResponse() {
  const sendIcon = "form button > svg.w-4";
  await waitElement(sendIcon, false);
  await waitElement(sendIcon, true);
  return Array.from(document.querySelectorAll(".prose")).pop().innerText;
}

async function handleClick(event) {
  const prompt = await waitResponse();

  if (prompt) {
    const response = await sendMessageToBackground({
      action: "findTabByTitle",
      targetTitle: backTabTitle,
    });

    if (response.success) {
      const generatedResponse = await sendMessageToBackground({
        action: "generateResponse",
        prompt: prompt,
        tabId: response.tabId,
      });

      if (generatedResponse && generatedResponse.success) {
        writePrompt(generatedResponse.response);
        submitPrompt();
      } else {
        console.error("Failed to generate response");
      }
    } else {
      console.error("Target tab not found");
    }
  }
}

function sendMessageToBackground(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

function submitPrompt() {
  document.querySelector("form button > svg.w-4").parentElement.click();
}

function writePrompt(text) {
  const textarea = document.getElementsByTagName("textarea")[0];
  textarea.focus();
  textarea.value = text;
  textarea.dispatchEvent(new Event("input", {
    bubbles: true,
    cancelable: true,
  }));
}

function handleMessageFromBackground(message, sender, sendResponse) {
  setTimeout(() => {
    if (message.action === "generateResponse") {
      waitResponse().then((response) => {
        sendResponse(response);
      });

      writePrompt(message.prompt);
      submitPrompt();
    }
  }, 100);
  return true;
}

(async () => {
  await getCompletedReadyState();

  const selectedTabBtn = "div > a.bg-gray-800 > div.absolute";
  await waitElement(selectedTabBtn);

  chrome.storage.sync.get(["frontTabTitle", "backTabTitle"], async (result) => {
    const currentTabTitle =
      document.querySelector(selectedTabBtn).previousElementSibling.innerText;
    if (result.frontTabTitle === currentTabTitle) {
      const form = document.querySelector("form");
      form.addEventListener("submit", handleClick);
      backTabTitle = result.backTabTitle;
    } else if (result.backTabTitle == currentTabTitle) {
      chrome.runtime.onMessage.addListener(handleMessageFromBackground);
    }
  });
})();
