import { Head, Link } from "@inertiajs/react";
import {
    Activity,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Clock3,
    FileSearch,
    MapPin,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import BlogLayout from "@/Layouts/BlogLayout";

import ArticleIntelligenceCard, {
    formatPublishedAt,
} from "@/Components/blog/articles/ArticleIntelligenceCard";

import { severityBadge } from "@/lib/geopoliticalSeverity";

const trendCopy = {
    rising: { label: "Escalation", icon: TrendingUp },
    falling: { label: "Decompressione", icon: TrendingDown },
    stable: { label: "Stabile", icon: Activity },
};

function buildArticleChips(article) {
    const chips = [];

    const region =
        article.region_name ||
        article.topic ||
        (Array.isArray(article.categories) ? article.categories[0] : null);

    if (region) {
        chips.push({
            icon: MapPin,
            value: region,
        });
    }

    const trend = trendCopy[article.trend_direction];

    if (trend) {
        chips.push({
            icon: trend.icon,
            value: trend.label,
        });
    }

    chips.push({
        icon: Clock3,
        value: formatPublishedAt(article.published_at),
    });

    return chips;
}

function EmptyArchive() {
    return (
        <div className="border border-dashed border-[#2A354D] bg-[#101620] p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#7E8796]">
                Archivio vuoto
            </p>

            <p className="mt-3 text-sm text-[#9CA3AF]">
                Non ci sono ancora dossier pubblicati. Torna presto per nuove
                analisi.
            </p>
        </div>
    );
}

function Pagination({ articles }) {
    if (articles.last_page <= 1) {
        return null;
    }

    return (
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#7E8796]">
                Pagina {articles.current_page} di {articles.last_page}
            </div>

            <div className="flex items-center gap-3">
                {articles.prev_page_url ? (
                    <Link
                        href={articles.prev_page_url}
                        preserveScroll
                        className="inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 text-sm text-[#AAB3C2] transition hover:border-[#D7B56D] hover:text-[#D7B56D]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Precedente
                    </Link>
                ) : (
                    <div className="inline-flex cursor-not-allowed items-center gap-2 border border-[#1B2435] bg-[#0D121B] px-4 py-2 text-sm text-[#4B5563]">
                        <ChevronLeft className="h-4 w-4" />
                        Precedente
                    </div>
                )}

                {articles.next_page_url ? (
                    <Link
                        href={articles.next_page_url}
                        preserveScroll
                        className="inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 text-sm text-[#AAB3C2] transition hover:border-[#D7B56D] hover:text-[#D7B56D]"
                    >
                        Successiva
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <div className="inline-flex cursor-not-allowed items-center gap-2 border border-[#1B2435] bg-[#0D121B] px-4 py-2 text-sm text-[#4B5563]">
                        Successiva
                        <ChevronRight className="h-4 w-4" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ArticlesIndex({
    articles = {
        data: [],
    },
    stats = {},
}) {
    const items = articles.data ?? [];

    const total = stats.total ?? articles.total ?? items.length;

    return (
        <>
            <Head title="Archivio dossier | Linea di gioco" />

            <BlogLayout>
                <section className="relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

                    <div className="relative p-4 sm:p-5 lg:p-8">
                        <Link
                            href={route("home")}
                            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9CA3AF] transition hover:text-[#D7B56D]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Command Hub
                        </Link>

                        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]">
                                    Intelligence Archive
                                </p>

                                <h1 className="mt-3 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-5xl">
                                    File declassificati
                                </h1>

                                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#AAB3C2]">
                                    Tutti i dossier geopolitici pubblicati:
                                    analisi su crisi, sicurezza, energia ed
                                    equilibri internazionali.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]">
                                <FileSearch className="h-4 w-4 text-[#D7B56D]" />
                                {total} dossier
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 sm:mt-10">
                    {items.length > 0 ? (
                        <>
                            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {items.map((article, index) => (
                                    <ArticleIntelligenceCard
                                        key={article.id}
                                        article={article}
                                        index={index}
                                        chips={buildArticleChips(article)}
                                        statusBadge={severityBadge(
                                            article.severity,
                                        )}
                                        ctaLabel="Apri dossier"
                                    />
                                ))}
                            </div>

                            <Pagination articles={articles} />
                        </>
                    ) : (
                        <EmptyArchive />
                    )}
                </section>
            </BlogLayout>
        </>
    );
}
