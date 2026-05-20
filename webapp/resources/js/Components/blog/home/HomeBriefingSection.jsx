import { Link } from "@inertiajs/react";
import { Radar, ShieldAlert } from "lucide-react";
import ArticleCoverImage from "@/Components/blog/articles/ArticleCoverImage";

export default function HomeBriefingSection({ articles = [] }) {
    return (
        <section className="mt-10 sm:mt-14 grid gap-6 border border-[#202A3D] bg-[#101620] p-4 sm:p-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10 text-[#D7B56D]">
                    <Radar className="h-5 w-5" />
                </div>
                <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                    Briefing rapido
                </p>
                <h3 className="mt-2 font-serif text-3xl text-[#F3F4F6]">
                    Ultime finestre operative
                </h3>
            </div>

            <div className="grid gap-3">
                {articles.length > 0 ? (
                    articles.slice(0, 5).map((article) => (
                        <Link
                            key={article.id}
                            href={route("blog.articles.show", {
                                id: article.id,
                                slug: article.slug,
                            })}
                            className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 border border-[#202A3D] bg-[#0B0F15] p-3 transition hover:border-[#D7B56D]/50 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:gap-4"
                        >
                            <ArticleCoverImage
                                item={article}
                                variant="thumb"
                                compact
                                className="h-14 border border-[#182234]"
                                sizes="76px"
                            />
                            <span className="min-w-0 truncate text-sm text-[#D7DEE8]">
                                {article.title}
                            </span>
                            <ShieldAlert className="h-4 w-4 shrink-0 text-[#D7B56D]" />
                        </Link>
                    ))
                ) : (
                    <p className="text-sm text-[#9CA3AF]">
                        Nessun briefing disponibile.
                    </p>
                )}
            </div>
        </section>
    );
}
