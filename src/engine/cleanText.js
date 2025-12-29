
const INVISIBLE_FORMAT_CHARS =
    /[\u200B-\u200D\u2060\uFEFF\u034F]/g;

const BIDI_CONTROL_CHARS =
    /[\u202A-\u202E\u2066-\u2069]/g;

const SOFT_LAYOUT_CHARS =
    /[\u00AD]/g;

const UNICODE_SPACES =
    /[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g;

const TAG_CHARS =
    /[\u{E0000}-\u{E007F}]/gu;

const VARIATION_SELECTORS =
    /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu;

function normalizeUnicode(text) {
    return text.normalize("NFKC");
}

function removeInvisibleChars(text) {
    return text
        .replace(INVISIBLE_FORMAT_CHARS, "")
        .replace(BIDI_CONTROL_CHARS, "")
        .replace(SOFT_LAYOUT_CHARS, "")
        .replace(TAG_CHARS, "")
        .replace(VARIATION_SELECTORS, "")
        .replace(UNICODE_SPACES, " ");
}

function normalizePunctuation(text) {
    return text
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/—/g, " ")
        .replace(/([–—-]){2,}/g, " ");
}

function normalizeWhitespace(text) {
    return text
        .replace(/\u00A0/g, " ")
        .replace(/\r\n/g, "\n")
        .replace(/\s+/g, " ")
        .replace(/[ \t]+$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
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


export { cleanText };