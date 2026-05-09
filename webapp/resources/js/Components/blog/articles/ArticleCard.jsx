import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import ArticleMeta from "@/Components/blog/articles/ArticleMeta";

export default function ArticleCard({ article }) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-[#1C2333] bg-[#131823] shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#2A354D]">
            <Link href={route("blog.articles.show", { id: article.id, slug: article.slug })} className="block">
                <div className="h-44 w-full overflow-hidden bg-[#0E1116]">
                    {article.thumb_url || article.cover_url ? (
                        <img
                            src={article.thumb_url || article.cover_url}
                            alt={article.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#1F3A5F]/40 to-[#9E2A2B]/25" />
                    )}
                </div>
                <div className="p-6">
                    <ArticleMeta topic={article.topic} publishedAt={article.published_at} />
                    <h3 className="mt-3 font-serif text-2xl leading-tight text-[#E5E7EB]">
                        {article.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#9CA3AF]">{article.excerpt}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#9E2A2B]">
                        Leggi articolo
                        <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </Link>
        </article>
    );
}
