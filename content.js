import { cleanText } from "./utils/cleaner.js";

let enabled = true;

chrome.storage.sync.get(["enabled"], (res) => {
  enabled = res.enabled !== false;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
  }
});

document.addEventListener("copy", (e) => {
  if (!enabled) return;

  const selection = window.getSelection();
  if (!selection) return;

  const rawText = selection.toString();
  if (!rawText) return;

  const cleaned = cleanText(rawText);

  e.clipboardData.setData("text/plain", cleaned);
  e.preventDefault();
});
