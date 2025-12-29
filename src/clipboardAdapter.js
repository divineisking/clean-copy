import { cleanText } from './engine/cleanText';

let enabled = true;

/**
 * Safe chrome access (prevents test crashes)
 */
function getChromeStorage() {
  if (typeof chrome === 'undefined') return null;
  if (!chrome.storage || !chrome.storage.sync) return null;
  return chrome.storage.sync;
}

/**
 * Initialize enabled flag (runtime only)
 */
const storage = getChromeStorage();
if (storage) {
  storage.get(['enabled'], (res) => {
    enabled = res.enabled !== false;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue;
    }
  });
}

/**
 * INSERTION HELPERS
 */

function insertIntoInput(target, text) {
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;

  target.value =
    target.value.slice(0, start) +
    text +
    target.value.slice(end);

  const cursor = start + text.length;
  target.setSelectionRange(cursor, cursor);
}

function insertIntoContentEditable(text) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // Critical for the test: collapsed ranges must still insert
  range.deleteContents();

  const node = document.createTextNode(text);
  range.insertNode(node);

  range.setStartAfter(node);
  range.setEndAfter(node);

  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * EVENT HANDLERS
 */

function handlePaste(event) {
  if (!enabled || !event.clipboardData) return;

  event.preventDefault();

  const rawText = event.clipboardData.getData('text/plain');
  const cleaned = cleanText(rawText);
  const target = event.target;

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    insertIntoInput(target, cleaned);
    return;
  }

  // Prefer inserting at current DOM selection for contenteditable targets.
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    insertIntoContentEditable(cleaned);
    return;
  }

  // Fallback: if the target itself is contenteditable, insert there.
  if (target.isContentEditable) {
    insertIntoContentEditable(cleaned);
  }
}

function handleCopy(event) {
  if (!enabled || !event.clipboardData) return;

  const target = event.target;

  // INPUT / TEXTAREA
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    if (start === end) return;

    const rawText = target.value.slice(start, end);
    const cleaned = cleanText(rawText);

    event.clipboardData.setData('text/plain', cleaned);
    event.preventDefault();
    return;
  }

  // CONTENT / DOCUMENT SELECTION
  const selection = window.getSelection();
  if (!selection) return;

  const rawText = selection.toString();
  if (!rawText) return;

  const cleaned = cleanText(rawText);

  event.clipboardData.setData('text/plain', cleaned);
  event.preventDefault();
}

function handleCut(event) {
  if (!enabled || !event.clipboardData) return;

  const target = event.target;

  // INPUT / TEXTAREA
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    if (start === end) return;

    const rawText = target.value.slice(start, end);
    const cleaned = cleanText(rawText);

    event.clipboardData.setData('text/plain', cleaned);
    target.value =
      target.value.slice(0, start) +
      target.value.slice(end);

    target.setSelectionRange(start, start);
    event.preventDefault();
    return;
  }

  // CONTENTEDITABLE
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rawText = selection.toString();
  if (!rawText) return;

  const cleaned = cleanText(rawText);

  event.clipboardData.setData('text/plain', cleaned);
  range.deleteContents();

  event.preventDefault();
}

/**
 * PUBLIC API
 */

export function attachClipboardCleaner(root = document) {
  root.addEventListener('paste', handlePaste);
  root.addEventListener('copy', handleCopy);
  root.addEventListener('cut', handleCut);
}
