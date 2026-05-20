import { Link } from "@inertiajs/react";
import {
    Activity,
    ArrowRight,
    Binary,
    FileSearch,
    MapPin,
    Radar,
    RadioTower,
    ShieldAlert,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import Marquee from "react-fast-marquee";
import { useMemo } from "react";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleCoverImage from "@/Components/blog/articles/ArticleCoverImage";
import ArticleIntelligenceCard from "@/Components/blog/articles/ArticleIntelligenceCard";
import SeoHead from "@/Components/Seo/SeoHead";
import { severityBadge } from "@/lib/geopoliticalSeverity";
import GlobalMap from "@/Components/blog/home/GlobalMap";

const trendCopy = {
    rising: { label: "Escalation", icon: TrendingUp },
    falling: { label: "Decompressione", icon: TrendingDown },
    stable: { label: "Stabile", icon: Activity },
};

function formatCoordinate(value, axis) {
    const numeric = Number(value) || 0;
    const direction =
        axis === "lat" ? (numeric >= 0 ? "N" : "S") : numeric >= 0 ? "E" : "W";

    return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}

function formatDate(value) {
    if (!value) {
        return "In arrivo";
    }

    return new Date(value).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function normalizeOperations(locations, articles) {
    if (locations.length > 0) {
        return locations.map((location) => ({
            ...location,
            title: location.article?.title || location.region_name,
            summary: location.article?.summary || location.status_label,
            url: location.article?.url || null,
            published_at: location.article?.published_at || location.updated_at,
            thumb_url:
                location.article?.thumb_url ||
                location.article?.cover_url ||
                null,
            cover_url:
                location.article?.cover_url ||
                location.article?.thumb_url ||
                null,
        }));
    }

    return articles.map((article, index) => ({
        ...article,
        title: article.title,
        summary: article.excerpt || article.summary,
        url: route("blog.articles.show", {
            id: article.id,
            slug: article.slug,
        }),
        region_name: article.topic || "Dossier globale",
        risk_score: 38,
        severity: index === 0 ? "elevated" : "guarded",
        trend_direction: "stable",
        operation_code:
            article.operation_code ||
            `OP-${String(article.id).padStart(4, "0")}`,
        article,
        thumb_url: article.thumb_url || article.cover_url || null,
        cover_url: article.cover_url || article.thumb_url || null,
    }));
}

function TacticalTicker({ items }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="mt-6 overflow-hidden border-y border-[#202A3D] bg-[#0B0F15] py-3">
            <Marquee gradient={false} speed={28} pauseOnHover>
                {items.map((item) => (
                    <div
                        key={`${item.id}-${item.title}`}
                        className="mx-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#9CA3AF]"
                    >
                        <RadioTower className="h-4 w-4 text-[#D7B56D]" />
                        <span className="text-[#D7B56D]">
                            {item.operation_code}
                        </span>
                        <span>
                            {formatCoordinate(item.lat, "lat")} /{" "}
                            {formatCoordinate(item.long, "long")}
                        </span>
                        <span className="max-w-[420px] truncate text-[#E8EDF5]">
                            {item.title}
                        </span>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}

function IntelligenceCard({ item, index }) {
    const TrendIcon = trendCopy[item.trend_direction]?.icon || Activity;

    return (
        <ArticleIntelligenceCard
            article={{
                id: item.article?.id ?? item.id,
                slug: item.article?.slug ?? String(item.id),
                title: item.title,
                summary: item.summary,
                cover_url: item.cover_url,
                thumb_url: item.thumb_url,
                operation_code: item.operation_code,
            }}
            index={index}
            href={item.url || route("blog.articles.index")}
            ctaLabel="Analizza dossier"
            statusBadge={severityBadge(item.severity)}
            imageLoading={index === 0 ? "eager" : "lazy"}
            imageFetchPriority={index === 0 ? "high" : "auto"}
            chips={[
                { icon: MapPin, value: item.region_name || "Hotspot" },
                {
                    icon: TrendIcon,
                    value: trendCopy[item.trend_direction]?.label || "Stabile",
                },
            ]}
        />
    );
}

function EmptyState() {
    return (
        <div className="border border-dashed border-[#2A354D] bg-[#101620] p-8 text-[#9CA3AF]">
            La sala operativa si popolera automaticamente con le prime analisi
            pubblicate.
        </div>
    );
}

export default function Welcome({
    latestArticles = [],
    briefingArticles = [],
    locations = [],
    tickerItems = [],
    stats = {},
}) {
    const operations = useMemo(
        () => normalizeOperations(locations, []),
        [locations],
    );
    const feedItems =
        operations.length > 0
            ? operations
            : normalizeOperations([], latestArticles);

    const statItems = [
        { label: "Dossier", value: stats.articlesCount || 0, icon: FileSearch },
        {
            label: "Hotspot",
            value: stats.hotspotsCount || operations.length,
            icon: Target,
        },
        {
            label: "Agg.",
            value: formatDate(stats.latestPublishedAt),
            icon: Binary,
        },
    ];
    const description =
        "Analisi geopolitiche, dossier internazionali e briefing AI su crisi, sicurezza, energia e hotspot globali monitorati in tempo reale.";
    const canonicalUrl = route("home");
    const organizationName = "Linea di gioco";
    const structuredData = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: organizationName,
            url: canonicalUrl,
            inLanguage: "it-IT",
            description,
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: organizationName,
            url: canonicalUrl,
            logo: `${route("home").replace(/\/$/, "")}/favicon.ico`,
        },
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Analisi geopolitiche e dossier internazionali",
            url: canonicalUrl,
            inLanguage: "it-IT",
            description,
            isPartOf: {
                "@type": "WebSite",
                name: organizationName,
                url: canonicalUrl,
            },
        },
    ];

    return (
        <>
            <SeoHead
                title="Analisi geopolitiche e dossier internazionali"
                description={description}
                canonicalUrl={canonicalUrl}
                keywords={[
                    "geopolitica",
                    "analisi geopolitica",
                    "dossier internazionali",
                    "crisi internazionali",
                    "intelligence open source",
                ]}
                structuredData={structuredData}
            />
            <BlogLayout>
                <GlobalMap operations={operations} />

                <TacticalTicker
                    items={operations.length > 0 ? operations : []}
                />

                <section className="mt-8 sm:mt-12 grid gap-4 md:grid-cols-3">
                    {statItems.map((item) => (
                        <div
                            key={item.label}
                            className="border border-[#202A3D] bg-[#101620] p-5"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#7E8796]">
                                    {item.label}
                                </p>
                                <item.icon className="h-5 w-5 text-[#D7B56D]" />
                            </div>
                            <div className="mt-4 font-mono text-2xl font-semibold text-[#E8EDF5]">
                                {item.value}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="mt-10 sm:mt-14">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                                Flusso analisi
                            </p>
                            <h2 className="mt-2 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl">
                                File declassificati
                            </h2>
                        </div>
                        <Link
                            href={route("blog.articles.index")}
                            className="inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]"
                        >
                            Archivio completo
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {feedItems.length > 0 ? (
                        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {feedItems.slice(0, 9).map((item, index) => (
                                <IntelligenceCard
                                    key={`${item.id}-${item.operation_code}`}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </section>

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
                        {briefingArticles.length > 0 ? (
                            briefingArticles.slice(0, 5).map((article) => (
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
                                        compact
                                        className="h-14 border border-[#182234]"
                                        sizes="76px"
                                        width={512}
                                        height={512}
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
            </BlogLayout>
        </>
    );
}
