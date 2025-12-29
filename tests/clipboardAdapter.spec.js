import { describe, it, expect, beforeEach, vi } from 'vitest';
import { attachClipboardCleaner } from '../src/clipboardAdapter.js';
import { cleanText } from '../src/engine/cleanText.js';

/// ------------------------------
// Mock chrome API for Vitest
// ------------------------------
global.chrome = {
  storage: {
    sync: {
      get: vi.fn((keys, cb) => cb({ enabled: true })),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
};

// Mock cleanText for predictable results
vi.mock('../src/engine/cleanText.js', () => ({
  cleanText: vi.fn((text) => text.replace(/[\u200B-\u200D]/g, '')),
}));

// Helper to create clipboard events
function createClipboardEvent(type, selectedText = '') {
  const event = new Event(type, { bubbles: true, cancelable: true });
  event.clipboardData = {
    getData: vi.fn(() => selectedText),
    setData: vi.fn(),
  };
  return event;
};

// ------------------------------
// Setup DOM and attach clipboard cleaner
// ------------------------------
beforeEach(() => {
  document.body.innerHTML = `
    <div contenteditable="true" id="editor"></div>
    <textarea id="textarea"></textarea>
    <input type="text" id="input" />
  `;

  attachClipboardCleaner();
});

// ------------------------------
// Tests
// ------------------------------
describe('Clipboard Adapter', () => {
  it('paste event cleans text and inserts at cursor', () => {
    const editor = document.getElementById('editor');
    editor.focus();

    // Simulate selection at start
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(editor, 0);
    selection.removeAllRanges();
    selection.addRange(range);

    // Simulate paste event
    const pasteEvent = createClipboardEvent('paste', 'hello\u200Bworld');

    editor.dispatchEvent(pasteEvent);

    expect(editor.textContent).toBe('helloworld');
    expect(cleanText).toHaveBeenCalledWith('hello\u200Bworld');
  });

  it('copy event sets cleaned text to clipboard', () => {
    const textarea = document.getElementById('textarea');
    textarea.value = 'copy\u200Bme';
    textarea.focus();
    textarea.select();

    const copyEvent = createClipboardEvent('copy', textarea.value);

    textarea.dispatchEvent(copyEvent);

    expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', 'copyme');
    expect(cleanText).toHaveBeenCalledWith('copy\u200Bme');
  });

  it('cut event cleans text and removes selection', () => {
    const input = document.getElementById('input');
    input.value = 'cut\u200Bthis';
    input.focus();
    input.select();

    const cutEvent = createClipboardEvent('cut', input.value);

    input.dispatchEvent(cutEvent);

    expect(cutEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', 'cutthis');
    expect(input.value).toBe(''); // cut removes content
  });
});
