import { escapeRegExp, safeText } from "@/lib/blog/text";

export function glossaryRegex(glossary) {
    const terms = Object.keys(glossary || {}).sort(
        (a, b) => b.length - a.length,
    );

    if (terms.length === 0) {
        return null;
    }

    return new RegExp(
        `(?<![\\p{L}\\p{N}])(${terms.map(escapeRegExp).join("|")})(?![\\p{L}\\p{N}])`,
        "giu",
    );
}

export function splitContentBlocks(content) {
    return safeText(content)
        .split(/\n{2,}/)
        .map((block) => safeText(block).trim())
        .filter(Boolean);
}
