import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Activity,
    ArrowRight,
    Binary,
    Crosshair,
    FileSearch,
    MapPin,
    Radar,
    RadioTower,
    Satellite,
    ShieldAlert,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import Marquee from "react-fast-marquee";
import {
    ComposableMap,
    Geographies,
    Geography,
    Graticule,
    Marker,
} from "react-simple-maps";
import { useMemo, useState } from "react";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleCoverImage from "@/Components/blog/articles/ArticleCoverImage";
import ArticleIntelligenceCard from "@/Components/blog/articles/ArticleIntelligenceCard";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const severityClasses = {
    high: {
        label: "Rosso",
        marker: "#EF4444",
        border: "border-[#EF4444]/50",
        text: "text-[#FCA5A5]",
        bg: "bg-[#EF4444]/10",
        fill: "#EF4444",
    },
    elevated: {
        label: "Arancione",
        marker: "#F97316",
        border: "border-[#F97316]/50",
        text: "text-[#FDBA74]",
        bg: "bg-[#F97316]/10",
        fill: "#F97316",
    },
    guarded: {
        label: "Giallo",
        marker: "#D7B56D",
        border: "border-[#D7B56D]/50",
        text: "text-[#FDE68A]",
        bg: "bg-[#D7B56D]/10",
        fill: "#D7B56D",
    },
    low: {
        label: "Verde",
        marker: "#22C55E",
        border: "border-[#22C55E]/50",
        text: "text-[#86EFAC]",
        bg: "bg-[#22C55E]/10",
        fill: "#22C55E",
    },
};

const trendCopy = {
    rising: { label: "Escalation", icon: TrendingUp },
    falling: { label: "Decompressione", icon: TrendingDown },
    stable: { label: "Stabile", icon: Activity },
};

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

function formatCoordinate(value, axis) {
    const numeric = Number(value) || 0;
    const direction = axis === "lat"
        ? numeric >= 0 ? "N" : "S"
        : numeric >= 0 ? "E" : "W";

    return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}

function normalizeOperations(locations, articles) {
    if (locations.length > 0) {
        return locations.map((location) => ({
            ...location,
            title: location.article?.title || location.region_name,
            summary: location.article?.summary || location.status_label,
            url: location.article?.url || null,
            published_at: location.article?.published_at || location.updated_at,
            thumb_url: location.article?.thumb_url || location.article?.cover_url || null,
            cover_url: location.article?.cover_url || location.article?.thumb_url || null,
        }));
    }

    return articles.map((article, index) => ({
        ...article,
        title: article.title,
        summary: article.excerpt || article.summary,
        url: route("blog.articles.show", { id: article.id, slug: article.slug }),
        region_name: article.topic || "Dossier globale",
        risk_score: 38,
        severity: index === 0 ? "elevated" : "guarded",
        trend_direction: "stable",
        operation_code: article.operation_code || `OP-${String(article.id).padStart(4, "0")}`,
        article,
        thumb_url: article.thumb_url || article.cover_url || null,
        cover_url: article.cover_url || article.thumb_url || null,
    }));
}

function GlobalMap({ operations }) {
    const [activeId, setActiveId] = useState(operations[0]?.id || null);
    const active = operations.find((item) => item.id === activeId) || operations[0];

    return (
        <section className="relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="relative grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-7">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]">
                                Global Situation Room
                            </p>
                            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#F3F4F6] md:text-6xl">
                                The Command Hub
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]">
                            <Satellite className="h-4 w-4 text-[#D7B56D]" />
                            AI watch active
                        </div>
                    </div>

                    <div className="mt-7 aspect-[1.72] w-full overflow-hidden border border-[#182234] bg-[#0B0F15]/80 [&_svg]:origin-center [&_svg]:scale-[1.1]">
                        <ComposableMap
                            projectionConfig={{ rotate: [-10, 0, 0], scale: 178 }}
                            className="h-full w-full"
                        >
                            <Graticule stroke="#233047" strokeWidth={0.35} />
                            <Geographies geography={geoUrl}>
                                {({ geographies }) => geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#111827"
                                        stroke="#263248"
                                        strokeWidth={0.42}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#162238", outline: "none" },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                ))}
                            </Geographies>

                            {operations.map((item) => {
                                const severity = severityClasses[item.severity] || severityClasses.guarded;

                                return (
                                    <Marker
                                        key={`${item.id}-${item.region_name}`}
                                        coordinates={[Number(item.long), Number(item.lat)]}
                                        onMouseEnter={() => setActiveId(item.id)}
                                        onFocus={() => setActiveId(item.id)}
                                    >
                                        <motion.g
                                            animate={{ scale: [1, 1.28, 1] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                            className="cursor-pointer"
                                        >
                                            <circle r={12} fill={severity.marker} fillOpacity={0.16} />
                                            <circle r={5.5} fill={severity.marker} fillOpacity={0.34} />
                                            <circle r={2.6} fill={severity.marker} />
                                        </motion.g>
                                    </Marker>
                                );
                            })}
                        </ComposableMap>
                    </div>
                </div>

                <aside className="border border-[#202A3D] bg-[#101620]/95 p-5">
                    {active ? (
                        <>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7E8796]">
                                        Hotspot selected
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold leading-tight text-[#F3F4F6]">
                                        {active.region_name}
                                    </h2>
                                </div>
                                <span className={`border px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] ${severityClasses[active.severity]?.border} ${severityClasses[active.severity]?.bg} ${severityClasses[active.severity]?.text}`}>
                                    {severityClasses[active.severity]?.label}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <SignalBox icon={Crosshair} label="Risk" value={active.risk_score} />
                                <SignalBox icon={MapPin} label="Coord" value={`${formatCoordinate(active.lat, "lat")} / ${formatCoordinate(active.long, "long")}`} />
                            </div>

                            <ArticleCoverImage item={active} className="mt-5 h-40 border border-[#202A3D]" />

                            <p className="mt-5 font-mono text-sm leading-7 text-[#B8C2D2]">
                                {active.title}
                            </p>

                            {active.url && (
                                <Link
                                    href={active.url}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 border border-[#D7B56D]/40 bg-[#D7B56D]/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[#FDE68A] transition hover:border-[#D7B56D]/70 hover:bg-[#D7B56D]/15"
                                >
                                    Apri dossier
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-80 items-center justify-center text-center font-mono text-sm uppercase tracking-[0.24em] text-[#7E8796]">
                            Nessun hotspot attivo
                        </div>
                    )}
                </aside>
            </div>
        </section>
    );
}

function SignalBox({ icon: Icon, label, value }) {
    return (
        <div className="border border-[#202A3D] bg-[#0B0F15] p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7E8796]">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <div className="mt-2 truncate font-mono text-sm text-[#E8EDF5]">{value}</div>
        </div>
    );
}

function TacticalTicker({ items }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="mt-6 overflow-hidden border-y border-[#202A3D] bg-[#0B0F15] py-3">
            <Marquee gradient={false} speed={28} pauseOnHover>
                {items.map((item) => (
                    <div key={`${item.id}-${item.title}`} className="mx-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#9CA3AF]">
                        <RadioTower className="h-4 w-4 text-[#D7B56D]" />
                        <span className="text-[#D7B56D]">{item.operation_code}</span>
                        <span>{formatCoordinate(item.lat, "lat")} / {formatCoordinate(item.long, "long")}</span>
                        <span className="max-w-[420px] truncate text-[#E8EDF5]">{item.title}</span>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}

function IntelligenceCard({ item, index }) {
    const severity = severityClasses[item.severity] || severityClasses.guarded;
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
            ctaLabel="Analizza file"
            statusBadge={severity}
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
            La situation room si popolera automaticamente con le prime analisi pubblicate.
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
    const operations = useMemo(() => normalizeOperations(locations, []), [locations]);
    const feedItems = operations.length > 0 ? operations : normalizeOperations([], latestArticles);

    const statItems = [
        { label: "Dossier", value: stats.articlesCount || 0, icon: FileSearch },
        { label: "Hotspot", value: stats.hotspotsCount || operations.length, icon: Target },
        { label: "Sync", value: formatDate(stats.latestPublishedAt), icon: Binary },
    ];

    return (
        <>
            <Head title="Global Situation Room | Linea di gioco" />
            <BlogLayout>
                <GlobalMap operations={operations} />

                <TacticalTicker items={operations.length > 0 ? operations : []} />

                <section className="mt-12 grid gap-4 md:grid-cols-3">
                    {statItems.map((item) => (
                        <div key={item.label} className="border border-[#202A3D] bg-[#101620] p-5">
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

                <section className="mt-14">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                                Intelligence Feed
                            </p>
                            <h2 className="mt-2 font-serif text-4xl leading-tight text-[#F3F4F6]">
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
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {feedItems.slice(0, 9).map((item, index) => (
                                <IntelligenceCard key={`${item.id}-${item.operation_code}`} item={item} index={index} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </section>

                <section className="mt-14 grid gap-6 border border-[#202A3D] bg-[#101620] p-6 lg:grid-cols-[0.75fr_1.25fr]">
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
                        {briefingArticles.length > 0 ? briefingArticles.slice(0, 5).map((article) => (
                            <Link
                                key={article.id}
                                href={route("blog.articles.show", { id: article.id, slug: article.slug })}
                                className="grid grid-cols-[76px_1fr_auto] items-center gap-4 border border-[#202A3D] bg-[#0B0F15] p-3 transition hover:border-[#D7B56D]/50"
                            >
                                <ArticleCoverImage item={article} compact className="h-14 border border-[#182234]" />
                                <span className="min-w-0 truncate text-sm text-[#D7DEE8]">{article.title}</span>
                                <ShieldAlert className="h-4 w-4 shrink-0 text-[#D7B56D]" />
                            </Link>
                        )) : (
                            <p className="text-sm text-[#9CA3AF]">Nessun briefing disponibile.</p>
                        )}
                    </div>
                </section>
            </BlogLayout>
        </>
    );
}
