document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.getElementById("settings-form");

  // Load saved settings
  chrome.storage.sync.get(
    [
      "frontTabTitle",
      "backTabTitle",
      "frontPrefix",
      "frontSuffix",
      "backPrefix",
      "backSuffix",
    ],
    (result) => {
      document.getElementById("front-tab-title").value = result.frontTabTitle ||
        "";
      document.getElementById("back-tab-title").value = result.backTabTitle ||
        "";
      document.getElementById("front-prefix").value = result.frontPrefix || "";
      document.getElementById("front-suffix").value = result.frontSuffix || "";
      document.getElementById("back-prefix").value = result.backPrefix || "";
      document.getElementById("back-suffix").value = result.backSuffix || "";
    },
  );

  // Save settings
  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const frontTabTitle = document.getElementById("front-tab-title").value;
    const backTabTitle = document.getElementById("back-tab-title").value;
    const frontPrefix = document.getElementById("front-prefix").value;
    const frontSuffix = document.getElementById("front-suffix").value;
    const backPrefix = document.getElementById("back-prefix").value;
    const backSuffix = document.getElementById("back-suffix").value;

    chrome.storage.sync.set(
      {
        frontTabTitle,
        backTabTitle,
        frontPrefix,
        frontSuffix,
        backPrefix,
        backSuffix,
      },
      async () => {
        await reloadTabs(frontTabTitle, backTabTitle);
        window.close();
      },
    );
  });
});

async function reloadTabs(frontTabTitle, backTabTitle) {
  return new Promise(async (resolve) => {
    const tabs = await new Promise((resolve) =>
      chrome.tabs.query({}, (tabs) => resolve(tabs))
    );

    let frontTab, backTab;

    for (const tab of tabs) {
      if (tab.title === frontTabTitle) {
        frontTab = tab;
      } else if (tab.title === backTabTitle) {
        backTab = tab;
      }

      if (frontTab && backTab) {
        break;
      }
    }

    if (frontTab) {
      chrome.tabs.reload(frontTab.id);
    }
    if (backTab) {
      chrome.tabs.reload(backTab.id);
    }

    resolve();
  });
}
