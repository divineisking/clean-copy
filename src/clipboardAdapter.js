import { clipboardPolicy } from './policy/clipboardPolicy.js';

function handleClipboardEvent(event) {

    const isGoogleDocs = location.hostname.includes('docs.google.com');
    if (isGoogleDocs) return; // Don't even try, let Docs handle it.

    const { type, clipboardData } = event;
    if (!clipboardData) return;

    // --- PATH 1: PASTE (Inbound: Clipboard -> Screen) ---
    // Inside handleClipboardEvent for PASTE
    if (type === 'paste') {
        const dirtyText = clipboardData.getData('text/plain');
        if (!dirtyText) return;

        const decision = clipboardPolicy({ operation: type, text: dirtyText });

        if (decision.preventDefault) {
            event.preventDefault();
            event.stopImmediatePropagation(); // <--- CRITICAL for Gmail

            // Attempt 1: Standard insert
            let success = document.execCommand("insertText", false, decision.text);

            // Attempt 2: Fallback for some Rich Text Editors (Force plain text insert)
            if (!success) {
                // This is a more aggressive insertion method
                const selection = window.getSelection();
                if (selection && selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents(); // Clear selected text if any
                    range.insertNode(document.createTextNode(decision.text));

                    // Move cursor to end of inserted text
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    success = true;
                }
            }
        }
    }

    // --- PATH 2: COPY / CUT (Outbound: Screen -> Clipboard) ---
    // For these, we DO look at what the user has selected on screen.

    // Inside handleClipboardEvent for COPY/CUT
    if (type === 'copy' || type === 'cut') {
        const selection = window.getSelection();
        const selectionText = selection?.toString() ?? "";

        if (!selectionText.trim()) return; // Docs fails here (returns empty)

        const decision = clipboardPolicy({ operation: type, text: selectionText });

        if (decision.preventDefault) {
            event.preventDefault();
            event.stopImmediatePropagation(); // <--- ADD THIS. Kills other listeners.

            clipboardData.clearData();
            clipboardData.setData("text/plain", decision.text);

            // Use 'text/html' too if you want to strip styles but keep the slot active
            // clipboardData.setData("text/html", decision.text); 

            if (decision.removeSelection && selection.rangeCount) {
                selection.deleteFromDocument();
            }
        }
    }
}

export function attachClipboardCleaner() {
    document.addEventListener("copy", handleClipboardEvent, true);
    document.addEventListener("cut", handleClipboardEvent, true);
    document.addEventListener("paste", handleClipboardEvent, true);
}