import BlogLayout from "@/Layouts/BlogLayout";
import ArchiveGrid from "@/Components/blog/archive/ArchiveGrid";
import ArchiveHero from "@/Components/blog/archive/ArchiveHero";
import SeoHead from "@/Components/Seo/SeoHead";
import { buildArchiveSeo } from "@/lib/blog/archiveSeo";

export default function ArticlesIndex({
    articles = { data: [] },
    stats = {},
}) {
    const items = articles.data ?? [];
    const total = stats.total ?? articles.total ?? items.length;
    const page = articles.current_page || 1;
    const canonicalUrl =
        page > 1
            ? `${route("blog.articles.index")}?page=${page}`
            : route("blog.articles.index");
    const seo = buildArchiveSeo(page, canonicalUrl);

    return (
        <>
            <SeoHead {...seo} />
            <BlogLayout>
                <ArchiveHero total={total} />
                <section className="mt-8 sm:mt-10">
                    <ArchiveGrid articles={articles} />
                </section>
            </BlogLayout>
        </>
    );
}
