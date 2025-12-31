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

  // src/policy/clipboardPolicy.js
  function clipboardPolicy({ operation, text }) {
    const cleaned = cleanText(text ?? "");
    if (operation === "paste") {
      return {
        text: cleaned,
        preventDefault: true
      };
    }
    if (operation === "copy") {
      return {
        text: cleaned,
        preventDefault: true,
        removeSelection: false
      };
    }
    if (operation === "cut") {
      return {
        text: cleaned,
        preventDefault: true,
        removeSelection: true
      };
    }
    return {
      text,
      preventDefault: true
    };
  }

  // src/clipboardAdapter.js
  function handleClipboardEvent(event) {
    const isGoogleDocs = location.hostname.includes("docs.google.com");
    if (isGoogleDocs) return;
    const { type, clipboardData } = event;
    if (!clipboardData) return;
    if (type === "paste") {
      const dirtyText = clipboardData.getData("text/plain");
      if (!dirtyText) return;
      const decision = clipboardPolicy({ operation: type, text: dirtyText });
      if (decision.preventDefault) {
        event.preventDefault();
        event.stopImmediatePropagation();
        let success = document.execCommand("insertText", false, decision.text);
        if (!success) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(decision.text));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            success = true;
          }
        }
      }
    }
    if (type === "copy" || type === "cut") {
      const selection = window.getSelection();
      const selectionText = selection?.toString() ?? "";
      if (!selectionText.trim()) return;
      const decision = clipboardPolicy({ operation: type, text: selectionText });
      if (decision.preventDefault) {
        event.preventDefault();
        event.stopImmediatePropagation();
        clipboardData.clearData();
        clipboardData.setData("text/plain", decision.text);
        if (decision.removeSelection && selection.rangeCount) {
          selection.deleteFromDocument();
        }
      }
    }
  }
  function attachClipboardCleaner() {
    document.addEventListener("copy", handleClipboardEvent, true);
    document.addEventListener("cut", handleClipboardEvent, true);
    document.addEventListener("paste", handleClipboardEvent, true);
  }

  // src/content.js
  attachClipboardCleaner();
})();
//# sourceMappingURL=content.js.map
