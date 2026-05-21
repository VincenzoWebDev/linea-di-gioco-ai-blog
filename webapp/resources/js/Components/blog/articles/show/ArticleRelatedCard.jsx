import { Link } from "@inertiajs/react";
import ArticleMeta from "@/Components/blog/articles/ArticleMeta";

export default function ArticleRelatedCard({ article }) {
    return (
        <Link
            href={route("blog.articles.show", {
                id: article.id,
                slug: article.slug,
            })}
            className="group grid grid-cols-1 gap-3 rounded-lg border border-[#202A3D] bg-[#121722] p-3 transition hover:border-[#D7B56D]/50 sm:grid-cols-[88px_1fr] sm:gap-4"
        >
            <div className="h-36 w-full overflow-hidden rounded-md bg-[#0B0F15] sm:h-20 sm:w-[88px]">
                {article.thumb_url ? (
                    <img
                        src={article.thumb_url}
                        alt={article.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width={384}
                        height={384}
                    />
                ) : (
                    <div className="h-full w-full bg-[#182234]" />
                )}
            </div>
            <div>
                <h4 className="font-serif text-lg leading-tight text-[#E8EDF5] group-hover:text-white">
                    {article.title}
                </h4>
                <div className="mt-2">
                    <ArticleMeta
                        topic={article.topic}
                        publishedAt={article.published_at}
                    />
                </div>
                {article.match_reason && (
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#D7B56D]">
                        {article.match_reason}
                    </p>
                )}
            </div>
        </Link>
    );
}
