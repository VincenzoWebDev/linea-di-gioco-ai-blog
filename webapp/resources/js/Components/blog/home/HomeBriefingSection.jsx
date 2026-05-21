import { Link } from "@inertiajs/react";
import { Archive, RadioTower } from "lucide-react";
import ArticleCoverImage from "@/Components/blog/articles/ArticleCoverImage";

export default function HomeBriefingSection({ items = [] }) {
    return (
        <section className="mt-10 sm:mt-14 grid gap-6 border border-[#202A3D] bg-[#101620] p-4 sm:p-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10 text-[#D7B56D]">
                    <Archive className="h-5 w-5" />
                </div>
                <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                    Storico cronologico
                </p>
                <h3 className="mt-2 font-serif text-3xl text-[#F3F4F6]">
                    Aree entrate in silenzio
                </h3>
            </div>

            <div className="grid gap-3">
                {items.length > 0 ? (
                    items.slice(0, 5).map((item) => (
                        <Link
                            key={item.id}
                            href={
                                item.url ||
                                route("blog.articles.index")
                            }
                            className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 border border-[#202A3D] bg-[#0B0F15] p-3 transition hover:border-[#D7B56D]/50 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:gap-4"
                        >
                            <ArticleCoverImage
                                item={item}
                                variant="thumb"
                                compact
                                className="h-14 border border-[#182234]"
                                sizes="76px"
                            />
                            <div className="min-w-0">
                                <span className="block truncate text-sm text-[#D7DEE8]">
                                    {item.title}
                                </span>
                                <span className="mt-1 block truncate font-mono text-[11px] uppercase tracking-[0.14em] text-[#7E8796]">
                                    {item.radio_silence_label}
                                </span>
                            </div>
                            <RadioTower className="h-4 w-4 shrink-0 text-[#D7B56D]" />
                        </Link>
                    ))
                ) : (
                    <p className="text-sm text-[#9CA3AF]">
                        Nessuna area storicizzata.
                    </p>
                )}
            </div>
        </section>
    );
}
