let frontTabTitle = '';
let backTabTitle = '';

chrome.storage.sync.get(['frontTabTitle', 'backTabTitle'], (result) => {
  frontTabTitle = result.frontTabTitle || '';
  backTabTitle = result.backTabTitle || '';
  document.getElementById('front-tab-title').value = frontTabTitle;
  document.getElementById('back-tab-title').value = backTabTitle;
});

function saveOptions() {
  frontTabTitle = document.getElementById('front-tab-title').value;
  backTabTitle = document.getElementById('back-tab-title').value;
  chrome.storage.sync.set({ frontTabTitle, backTabTitle });
}

document.getElementById('options-form').addEventListener('submit', (event) => {
  event.preventDefault();
  saveOptions();
});
