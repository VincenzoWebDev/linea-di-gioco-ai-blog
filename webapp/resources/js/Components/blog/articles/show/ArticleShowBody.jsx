import { ExternalLink } from "lucide-react";
import ArticleGlossaryContent from "@/Components/blog/articles/show/ArticleGlossaryContent";

export default function ArticleShowBody({ article, glossary }) {
    return (
        <main className="min-w-0">
            <div className="border-l border-[#2A354D] pl-4 sm:pl-5">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                    Rapporto sintetico
                </p>
            </div>
            <div className="mt-2 break-words text-base sm:text-lg">
                <ArticleGlossaryContent
                    content={article.content}
                    glossary={glossary}
                />
            </div>

            {article.source_url && (
                <a
                    href={article.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-10 inline-flex items-center gap-2 border border-[#2A354D] bg-[#121722] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]"
                >
                    <ExternalLink className="h-4 w-4" />
                    Fonte
                </a>
            )}
        </main>
    );
}
