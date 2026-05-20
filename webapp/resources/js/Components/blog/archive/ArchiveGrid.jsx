import ArticleIntelligenceCard from "@/Components/blog/articles/ArticleIntelligenceCard";
import { buildArticleChips } from "@/lib/blog/articleChips";
import { severityBadge } from "@/lib/geopoliticalSeverity";
import ArchiveEmptyState from "@/Components/blog/archive/ArchiveEmptyState";
import ArchivePagination from "@/Components/blog/archive/ArchivePagination";

export default function ArchiveGrid({ articles }) {
    const items = articles.data ?? [];
    if (items.length === 0) {
        return <ArchiveEmptyState />;
    }

    return (
        <>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {items.map((article, index) => (
                    <ArticleIntelligenceCard
                        key={article.id}
                        article={article}
                        index={index}
                        chips={buildArticleChips(article)}
                        statusBadge={severityBadge(article.severity)}
                        ctaLabel="Apri dossier"
                        imageLoading={index === 0 ? "eager" : "lazy"}
                        imageFetchPriority={index === 0 ? "high" : "auto"}
                    />
                ))}
            </div>

            <ArchivePagination articles={articles} />
        </>
    );
}
