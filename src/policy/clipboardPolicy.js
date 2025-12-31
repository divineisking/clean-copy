import { cleanText } from '../engine/cleanText.js';

/**
 * PURE decision engine for clipboard operations
 */
export function clipboardPolicy({ operation, text }) {
    const cleaned = cleanText(text ?? '');

    if (operation === 'paste') {
        return {
            text: cleaned,
            preventDefault: true
        };
    }

    if (operation === 'copy') {
        return {
            text: cleaned,
            preventDefault: true,
            removeSelection: false
        };
    }

    if (operation === 'cut') {
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
