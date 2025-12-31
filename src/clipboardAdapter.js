import { clipboardPolicy } from './policy/clipboardPolicy.js';

// src/clipboardAdapter.js
function handleClipboardEvent(event) {
  const { type, clipboardData } = event;
  if (!clipboardData) return;

  const selection = window.getSelection();
  const selectionText = selection?.toString() ?? "";

  // 1. SAFETY CHECK: If we can't see the text (e.g., Google Docs), 
  // DO NOT INTERFERE. Let the app handle it.
  if (!selectionText.trim()) {
    return; 
  }

  const decision = clipboardPolicy({
    operation: type,
    text: selectionText
  });

  if (decision.preventDefault) {
    event.preventDefault();
    
    // 2. CRITICAL: Clear existing data (like dirty text/html)
    // before setting our clean version.
    clipboardData.clearData(); 
    clipboardData.setData("text/plain", decision.text);
  }

  if (decision.removeSelection && selection) {
     if (selection.rangeCount) {
       selection.deleteFromDocument();
     }
  }
}

function attachClipboardCleaner() {
  // 3. USE CAPTURE: Pass 'true' as the third argument.
  // This ensures we run BEFORE the website's own listeners.
  document.addEventListener("copy", handleClipboardEvent, true);
  document.addEventListener("cut", handleClipboardEvent, true);
}