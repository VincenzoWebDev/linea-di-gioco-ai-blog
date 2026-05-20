import GlossaryTooltip from "@/Components/blog/articles/show/GlossaryTooltip";
import { glossaryRegex, splitContentBlocks } from "@/lib/blog/glossary";
import { safeText } from "@/lib/blog/text";

function renderGlossaryText(text, glossary) {
    const regex = glossaryRegex(glossary);
    const normalizedText = safeText(text);

    if (!regex) {
        return normalizedText;
    }

    const parts = normalizedText.split(regex);

    return parts.map((part, index) => {
        const normalizedPart = safeText(part);
        const term = Object.keys(glossary).find(
            (item) =>
                safeText(item).toLowerCase() === normalizedPart.toLowerCase(),
        );

        if (!term) {
            return normalizedPart;
        }

        return (
            <GlossaryTooltip
                key={`${normalizedPart}-${index}`}
                term={term}
                entry={glossary[term]}
            />
        );
    });
}

export default function ArticleGlossaryContent({ content, glossary = {} }) {
    return splitContentBlocks(content).map((text, index) => {
        const isHeading =
            text.length < 90 && !text.includes(".") && index > 0;

        if (isHeading) {
            return (
                <h2
                    key={`${text}-${index}`}
                    className="mt-10 font-serif text-3xl leading-tight text-[#F3F4F6]"
                >
                    {renderGlossaryText(text, glossary)}
                </h2>
            );
        }

        return (
            <p
                key={`${text}-${index}`}
                className="mt-6 whitespace-pre-line leading-[1.9] text-[#D7DEE8]"
            >
                {renderGlossaryText(text, glossary)}
            </p>
        );
    });
}
