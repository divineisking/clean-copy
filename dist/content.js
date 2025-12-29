(() => {
  // src/engine/cleanText.js
  var INVISIBLE_FORMAT_CHARS = /[\u200B-\u200D\u2060\uFEFF\u034F]/g;
  var BIDI_CONTROL_CHARS = /[\u202A-\u202E\u2066-\u2069]/g;
  var SOFT_LAYOUT_CHARS = /[\u00AD]/g;
  var UNICODE_SPACES = /[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g;
  var TAG_CHARS = /[\u{E0000}-\u{E007F}]/gu;
  var VARIATION_SELECTORS = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu;
  function normalizeUnicode(text) {
    return text.normalize("NFKC");
  }
  function removeInvisibleChars(text) {
    return text.replace(INVISIBLE_FORMAT_CHARS, "").replace(BIDI_CONTROL_CHARS, "").replace(SOFT_LAYOUT_CHARS, "").replace(TAG_CHARS, "").replace(VARIATION_SELECTORS, "").replace(UNICODE_SPACES, " ");
  }
  function normalizePunctuation(text) {
    return text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/—/g, " ").replace(/([–—-]){2,}/g, " ");
  }
  function normalizeWhitespace(text) {
    return text.replace(/\u00A0/g, " ").replace(/\r\n/g, "\n").replace(/\s+/g, " ").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  }
  function cleanText(text) {
    if (!text) return "";
    return normalizeWhitespace(
      normalizePunctuation(
        removeInvisibleChars(
          normalizeUnicode(text)
        )
      )
    );
  }

  // src/clipboardAdapter.js
  var enabled = true;
  function getChromeStorage() {
    if (typeof chrome === "undefined") return null;
    if (!chrome.storage || !chrome.storage.sync) return null;
    return chrome.storage.sync;
  }
  var storage = getChromeStorage();
  if (storage) {
    storage.get(["enabled"], (res) => {
      enabled = res.enabled !== false;
    });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabled) {
        enabled = changes.enabled.newValue;
      }
    });
  }
  function insertIntoInput(target, text) {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    target.value = target.value.slice(0, start) + text + target.value.slice(end);
    const cursor = start + text.length;
    target.setSelectionRange(cursor, cursor);
  }
  function insertIntoContentEditable(text) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  function handlePaste(event) {
    if (!enabled || !event.clipboardData) return;
    event.preventDefault();
    const rawText = event.clipboardData.getData("text/plain");
    const cleaned = cleanText(rawText);
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      insertIntoInput(target, cleaned);
      return;
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      insertIntoContentEditable(cleaned);
      return;
    }
    if (target.isContentEditable) {
      insertIntoContentEditable(cleaned);
    }
  }
  function handleCopy(event) {
    if (!enabled || !event.clipboardData) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      if (start === end) return;
      const rawText2 = target.value.slice(start, end);
      const cleaned2 = cleanText(rawText2);
      event.clipboardData.setData("text/plain", cleaned2);
      event.preventDefault();
      return;
    }
    const selection = window.getSelection();
    if (!selection) return;
    const rawText = selection.toString();
    if (!rawText) return;
    const cleaned = cleanText(rawText);
    event.clipboardData.setData("text/plain", cleaned);
    event.preventDefault();
  }
  function handleCut(event) {
    if (!enabled || !event.clipboardData) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      if (start === end) return;
      const rawText2 = target.value.slice(start, end);
      const cleaned2 = cleanText(rawText2);
      event.clipboardData.setData("text/plain", cleaned2);
      target.value = target.value.slice(0, start) + target.value.slice(end);
      target.setSelectionRange(start, start);
      event.preventDefault();
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const rawText = selection.toString();
    if (!rawText) return;
    const cleaned = cleanText(rawText);
    event.clipboardData.setData("text/plain", cleaned);
    range.deleteContents();
    event.preventDefault();
  }
  function attachClipboardCleaner(root = document) {
    root.addEventListener("paste", handlePaste);
    root.addEventListener("copy", handleCopy);
    root.addEventListener("cut", handleCut);
  }

  // src/content.js
  attachClipboardCleaner();
})();
//# sourceMappingURL=content.js.map
