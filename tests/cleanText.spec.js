import { describe, it, expect } from "vitest";

import { cleanText } from "../src/engine/cleanText.js";

describe("cleanText reachability", () => {
    it("cleanText is a function", () => {
        expect(typeof cleanText).toBe("function");
    });

    it("cleanText returns a string", () => {
        const result = cleanText("test");
        expect(typeof result).toBe("string");
    });
});

describe("cleanText – dash removal", () => {
    it("removes em dash", () => {
        expect(cleanText("Hello—world")).toBe("Hello world");
    });

});

describe("cleanText – whitespace normalization", () => {
    it("collapses multiple spaces into one", () => {
        const input = "Hello   world";
        expect(cleanText(input)).toBe("Hello world");
    });

    it("trims leading and trailing whitespace", () => {
        const input = "   Hello world   ";
        expect(cleanText(input)).toBe("Hello world");
    });

    it("cleans up extra spaces caused by dash removal", () => {
        const input = "Hello—  world";
        expect(cleanText(input)).toBe("Hello world");
    });

    it("handles multiple dash replacements cleanly", () => {
        const input = "Hello—world––again";
        expect(cleanText(input)).toBe("Hello world again");
    });
});

describe("cleanText – AI hidden characters", () => {
    it("removes zero-width space", () => {
        const input = "Hel\u200Blo";
        expect(cleanText(input)).toBe("Hello");
    });

    it("removes zero-width joiner", () => {
        const input = "Hel\u200Dlo";
        expect(cleanText(input)).toBe("Hello");
    });

    it("removes BOM / zero-width no-break space", () => {
        const input = "\uFEFFHello";
        expect(cleanText(input)).toBe("Hello");
    });

    it("removes bidi control characters", () => {
        const input = "Hello\u202E world";
        expect(cleanText(input)).toBe("Hello world");
    });

    it("removes soft hyphen", () => {
        const input = "Hel\u00ADlo";
        expect(cleanText(input)).toBe("Hello");
    });

    it("removes word joiner", () => {
        const input = "Hel\u2060lo";
        expect(cleanText(input)).toBe("Hello");
    });

    it("removes hidden watermark", () => {
        expect(cleanText("A\u2060B")).toBe("AB");
        expect(cleanText("A\u034FB")).toBe("AB");
    });

    it('removes Bidi trojan', () => {
        expect(cleanText("abc\u202E123")).toBe("abc123");
    });

    it("removes fake space", () => {
       expect(cleanText("hello\u2009world")).toBe("hello world");
    });

    it("removes tag injection", () => {
      expect(cleanText("safe\u{E0001}text")).toBe("safetext");
    });

    it("Variation selector fingerprint", () => {
      expect(cleanText("✌️")).toBe("✌");
    });
});
