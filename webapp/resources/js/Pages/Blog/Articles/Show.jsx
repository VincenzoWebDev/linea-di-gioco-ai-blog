import { Link } from "@inertiajs/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ArrowLeft } from "lucide-react";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleShowBody from "@/Components/blog/articles/show/ArticleShowBody";
import ArticleShowCover from "@/Components/blog/articles/show/ArticleShowCover";
import ArticleShowHeader from "@/Components/blog/articles/show/ArticleShowHeader";
import ArticleShowIntelligenceSidebar from "@/Components/blog/articles/show/ArticleShowIntelligenceSidebar";
import ArticleShowRelatedSection from "@/Components/blog/articles/show/ArticleShowRelatedSection";
import SeoHead from "@/Components/Seo/SeoHead";
import { buildIntelligence } from "@/lib/blog/intelligence";
import { safeText } from "@/lib/blog/text";

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
    const intelligence = buildIntelligence(article, riskThresholds);
    const canonicalUrl = route("blog.articles.show", {
        id: article.id,
        slug: article.slug,
    });

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
                <Tooltip.Provider>
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
                            <ArticleShowIntelligenceSidebar
                                article={article}
                                intelligence={intelligence}
                            />
                        </div>
                    </article>

                    <ArticleShowRelatedSection related={related} />
                </Tooltip.Provider>
            </BlogLayout>
        </>
    );
}
