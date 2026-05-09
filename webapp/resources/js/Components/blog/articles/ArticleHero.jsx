import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import ArticleMeta from "@/Components/blog/articles/ArticleMeta";

export default function ArticleHero({ article }) {
    if (!article) {
        return null;
    }

    return (
        <article className="overflow-hidden rounded-[2rem] border border-[#1C2333] bg-[#131823] shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
            <div className="grid lg:grid-cols-[1.2fr_1fr]">
                <div className="h-72 lg:h-full">
                    {article.cover_url || article.thumb_url ? (
                        <img
                            src={article.cover_url || article.thumb_url}
                            alt={article.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#1F3A5F]/40 to-[#9E2A2B]/30" />
                    )}
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-10">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">Ultima analisi</p>
                    <h2 className="mt-4 font-serif text-4xl leading-tight text-[#E5E7EB]">{article.title}</h2>
                    <p className="mt-4 max-w-xl text-[#9CA3AF]">{article.excerpt}</p>
                    <div className="mt-6">
                        <ArticleMeta topic={article.topic} publishedAt={article.published_at} />
                    </div>
                    <Link
                        href={route("blog.articles.show", { id: article.id, slug: article.slug })}
                        className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-[#1F3A5F] px-6 py-3 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-[#264a79]"
                    >
                        Approfondisci
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
