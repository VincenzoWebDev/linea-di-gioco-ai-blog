import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import { ArrowLeft } from "lucide-react";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleShowBody from "@/Components/blog/articles/show/ArticleShowBody";
import ArticleShowCover from "@/Components/blog/articles/show/ArticleShowCover";
import ArticleShowHeader from "@/Components/blog/articles/show/ArticleShowHeader";
import ArticleShowRelatedSection from "@/Components/blog/articles/show/ArticleShowRelatedSection";
import SeoHead from "@/Components/Seo/SeoHead";
import { buildIntelligence } from "@/lib/blog/intelligence";
import { safeText } from "@/lib/blog/text";

const ArticleShowIntelligenceSidebar = lazy(
    () => import("@/Components/blog/articles/show/ArticleShowIntelligenceSidebar"),
);

function buildMetaDescription(article) {
    if (article.summary) {
        return article.summary;
    }

    const excerpt = safeText(article.content)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 157);

    return excerpt ? `${excerpt}...` : "";
}

export default function ArticlesShow({
    article,
    related = [],
    glossary = {},
    riskThresholds = {},
    newsArticleSchema = null,
}) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const intelligence = buildIntelligence(article, riskThresholds);
    const canonicalUrl = route("blog.articles.show", {
        id: article.id,
        slug: article.slug,
    });

    const sidebarFallback = (
        <aside className="min-w-0 max-w-full lg:sticky lg:top-8 lg:self-start">
            <div className="border border-[#202A3D] bg-[#0B0F15]/90 p-4 shadow-2xl shadow-black/20 sm:p-5">
                <div className="h-[420px] animate-pulse border border-[#182234] bg-[#121722]" />
            </div>
        </aside>
    );

    return (
        <>
            <SeoHead
                title={article.title}
                description={buildMetaDescription(article)}
                canonicalUrl={canonicalUrl}
                image={article.cover_url || article.thumb_url}
                type="article"
                keywords={article.categories || []}
                publishedTime={article.published_at}
                modifiedTime={article.updated_at || article.published_at}
                section={
                    article.topic || article.categories?.[0] || "Geopolitica"
                }
                structuredData={newsArticleSchema}
            />
            <BlogLayout>
                <TooltipProvider>
                    <article>
                        <Link
                            href={route("blog.articles.index")}
                            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9CA3AF] transition hover:text-[#E5E7EB]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Torna agli articoli
                        </Link>

                        <ArticleShowHeader
                            article={article}
                            intelligence={intelligence}
                        />
                        <ArticleShowCover article={article} />

                        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_430px]">
                            <ArticleShowBody
                                article={article}
                                glossary={glossary}
                            />
                            {isClient ? (
                                <Suspense fallback={sidebarFallback}>
                                    <ArticleShowIntelligenceSidebar
                                        article={article}
                                        intelligence={intelligence}
                                    />
                                </Suspense>
                            ) : (
                                sidebarFallback
                            )}
                        </div>
                    </article>

                    <ArticleShowRelatedSection related={related} />
                </TooltipProvider>
            </BlogLayout>
        </>
    );
}
