import { Head, Link } from "@inertiajs/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import {
    Activity,
    ArrowLeft,
    Clock3,
    Crosshair,
    ExternalLink,
    FileSearch,
    Info,
    MapPin,
    RadioTower,
    Shield,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from "recharts";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleMeta from "@/Components/blog/articles/ArticleMeta";

const regionCoordinates = [
    { match: "medio oriente", label: "31.7683 N / 35.2137 E" },
    { match: "europa", label: "50.1109 N / 8.6821 E" },
    { match: "africa", label: "9.0820 N / 8.6753 E" },
    { match: "asia", label: "34.0479 N / 100.6197 E" },
    { match: "ucraina", label: "50.4501 N / 30.5234 E" },
    { match: "russia", label: "55.7558 N / 37.6173 E" },
    { match: "cina", label: "39.9042 N / 116.4074 E" },
    { match: "usa", label: "38.9072 N / 77.0369 W" },
    { match: "stati uniti", label: "38.9072 N / 77.0369 W" },
    { match: "mediterraneo", label: "35.0000 N / 18.0000 E" },
];

function RelatedItem({ article }) {
    return (
        <Link
            href={route("blog.articles.show", { id: article.id, slug: article.slug })}
            className="group grid grid-cols-[88px_1fr] gap-4 rounded-lg border border-[#202A3D] bg-[#121722] p-3 transition hover:border-[#D7B56D]/50"
        >
            <div className="h-20 w-[88px] overflow-hidden rounded-md bg-[#0B0F15]">
                {article.thumb_url ? (
                    <img src={article.thumb_url} alt={article.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-[#182234]" />
                )}
            </div>
            <div>
                <h4 className="font-serif text-lg leading-tight text-[#E8EDF5] group-hover:text-white">
                    {article.title}
                </h4>
                <div className="mt-2">
                    <ArticleMeta topic={article.topic} publishedAt={article.published_at} />
                </div>
            </div>
        </Link>
    );
}

function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, Math.round(Number(value) || 0)));
}

function hashScore(seed, offset) {
    const chars = `${seed}-${offset}`;
    let hash = 0;

    for (let index = 0; index < chars.length; index += 1) {
        hash = (hash * 31 + chars.charCodeAt(index)) % 9973;
    }

    return 34 + (hash % 53);
}

function formatDateTime(value) {
    if (!value) {
        return "Non disponibile";
    }

    return new Intl.DateTimeFormat("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function findCoordinates(article) {
    const region = [
        article.tension?.region_name,
        article.topic,
        ...(article.categories || []),
        article.title,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return regionCoordinates.find((item) => region.includes(item.match))?.label || "41.9028 N / 12.4964 E";
}

function trendConfig(direction) {
    if (direction === "rising") {
        return {
            icon: TrendingUp,
            label: "In crescita",
            color: "text-[#EF4444]",
            bg: "bg-[#EF4444]/10",
        };
    }

    if (direction === "falling") {
        return {
            icon: TrendingDown,
            label: "In calo",
            color: "text-[#38BDF8]",
            bg: "bg-[#38BDF8]/10",
        };
    }

    return {
        icon: Activity,
        label: "Stabile",
        color: "text-[#D7B56D]",
        bg: "bg-[#D7B56D]/10",
    };
}

function buildIntelligence(article) {
    const seed = `${article.id}-${article.title}-${article.summary || ""}`;
    const riskScore = clamp(article.tension?.risk_score ?? hashScore(seed, "risk"));
    const qualityScore = clamp(article.quality_score ?? hashScore(seed, "quality"));
    const categoryPressure = clamp((article.categories?.length || 1) * 18 + hashScore(seed, "category") / 3);

    const metrics = [
        { axis: "Militare", value: clamp(riskScore + hashScore(seed, "military") / 8 - 5) },
        { axis: "Economico", value: clamp(categoryPressure + hashScore(seed, "economy") / 4) },
        { axis: "Diplomatico", value: clamp(riskScore * 0.72 + hashScore(seed, "diplomacy") / 3) },
        { axis: "Energia", value: clamp(hashScore(seed, "energy") + (article.topic || "").length) },
        { axis: "Informativo", value: clamp(qualityScore * 0.82 + hashScore(seed, "info") / 5) },
    ];

    const averageImpact = clamp(metrics.reduce((sum, item) => sum + item.value, 0) / metrics.length);
    const alertLevel = riskScore >= 75 ? "Rosso" : riskScore >= 55 ? "Arancione" : riskScore >= 35 ? "Giallo" : "Verde";
    const alertClasses = {
        Rosso: "border-[#EF4444]/50 bg-[#EF4444]/15 text-[#FCA5A5]",
        Arancione: "border-[#F97316]/50 bg-[#F97316]/15 text-[#FDBA74]",
        Giallo: "border-[#D7B56D]/50 bg-[#D7B56D]/15 text-[#FDE68A]",
        Verde: "border-[#22C55E]/50 bg-[#22C55E]/15 text-[#86EFAC]",
    };

    return {
        alertLevel,
        alertClasses: alertClasses[alertLevel],
        averageImpact,
        coordinates: findCoordinates(article),
        metrics,
        riskScore,
        qualityScore,
        scenario: riskScore >= 65
            ? "Probabile intensificazione della pressione diplomatica e aumento della sorveglianza nelle prossime finestre operative."
            : "Scenario in consolidamento: monitorare segnali politici, catene logistiche e variazioni nella postura militare regionale.",
    };
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function glossaryRegex(glossary) {
    const terms = Object.keys(glossary || {}).sort((a, b) => b.length - a.length);

    if (terms.length === 0) {
        return null;
    }

    return new RegExp(`(?<![\\p{L}\\p{N}])(${terms.map(escapeRegExp).join("|")})(?![\\p{L}\\p{N}])`, "giu");
}

function renderGlossaryText(text, glossary) {
    const regex = glossaryRegex(glossary);

    if (!regex) {
        return text;
    }

    const parts = String(text).split(regex);

    return parts.map((part, index) => {
        const term = Object.keys(glossary).find((item) => item.toLowerCase() === part.toLowerCase());

        if (!term) {
            return part;
        }

        return (
            <GlossaryTooltip key={`${part}-${index}`} term={term} entry={glossary[term]} />
        );
    });
}

function renderContent(content, glossary) {
    return String(content || "")
        .split(/\n{2,}/)
        .map((block, index) => {
            const text = block.trim();

            if (!text) {
                return null;
            }

            const isHeading = text.length < 90 && !text.includes(".") && index > 0;

            if (isHeading) {
                return (
                    <h2 key={`${text}-${index}`} className="mt-10 font-serif text-3xl leading-tight text-[#F3F4F6]">
                        {renderGlossaryText(text, glossary)}
                    </h2>
                );
            }

            return (
                <p key={`${text}-${index}`} className="mt-6 whitespace-pre-line leading-[1.9] text-[#D7DEE8]">
                    {renderGlossaryText(text, glossary)}
                </p>
            );
        });
}

function GlossaryTooltip({ term, entry }) {
    return (
        <Tooltip.Root delayDuration={120}>
            <Tooltip.Trigger asChild>
                <span className="group inline-flex cursor-help items-baseline gap-1 border-b border-dotted border-[#D7B56D]/80 text-[#F3F4F6] decoration-transparent transition hover:text-[#FDE68A]">
                    <span>{term}</span>
                    <Info className="h-3 w-3 translate-y-[1px] opacity-0 transition group-hover:opacity-100" />
                </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content side="top" align="center" sideOffset={10} collisionPadding={16} asChild>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="z-50 max-w-xs border border-[#D7B56D]/40 bg-[#0B0F15]/95 px-4 py-3 font-mono text-sm text-[#D7DEE8] shadow-2xl shadow-black/40 backdrop-blur"
                    >
                        <div className="text-[11px] uppercase tracking-[0.24em] text-[#D7B56D]">{term}</div>
                        <p className="mt-2 leading-6">{entry.definition}</p>
                        {entry.importance && (
                            <div className="mt-3 border-t border-[#202A3D] pt-2 text-[11px] uppercase tracking-[0.2em] text-[#8FA0B6]">
                                Importanza: <span className="text-[#F3F4F6]">{entry.importance}</span>
                            </div>
                        )}
                        <Tooltip.Arrow className="fill-[#D7B56D]/40" />
                    </motion.div>
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}

function DataPill({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0 border-l border-[#2A354D] px-4 py-2 first:border-l-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#7E8796]">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <div className="mt-1 truncate font-mono text-sm text-[#E8EDF5]">{value}</div>
        </div>
    );
}

function IntelligenceSidebar({ article, intelligence }) {
    const trend = trendConfig(article.tension?.trend_direction);
    const TrendIcon = trend.icon;

    return (
        <aside className="lg:sticky lg:top-8 lg:self-start">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="border border-[#202A3D] bg-[#0B0F15]/90 p-5 shadow-2xl shadow-black/20"
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#7E8796]">
                            Intelligence Matrix
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-[#F3F4F6]">Impatto operativo</h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10">
                        <RadarIcon />
                    </div>
                </div>

                <div className="mt-5 h-80 border border-[#182234] bg-[#0E1116] px-2 py-3">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={intelligence.metrics} outerRadius="64%" margin={{ top: 18, right: 34, bottom: 18, left: 34 }}>
                            <PolarGrid stroke="#2A354D" radialLines />
                            <PolarAngleAxis
                                dataKey="axis"
                                tick={{ fill: "#AAB3C2", fontSize: 10, fontFamily: "monospace" }}
                            />
                            <Radar
                                dataKey="value"
                                stroke="#D7B56D"
                                fill="#D7B56D"
                                fillOpacity={0.22}
                                strokeWidth={2}
                                animationDuration={900}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    <MetricBlock label="Rischio" value={intelligence.riskScore} icon={Crosshair} />
                    <MetricBlock label="Impatto" value={intelligence.averageImpact} icon={Target} />
                    <MetricBlock label="Fonte" value={intelligence.qualityScore} icon={Shield} />
                </div>

                <div className="mt-5 grid gap-3">
                    <div className="flex items-center justify-between border border-[#202A3D] bg-[#121722] px-4 py-3">
                        <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7E8796]">
                                Trend
                            </p>
                            <p className="mt-1 text-sm text-[#D7DEE8]">{trend.label}</p>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${trend.bg} ${trend.color}`}>
                            <TrendIcon className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="border border-[#202A3D] bg-[#121722] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7E8796]">
                            Scenari futuri
                        </p>
                        <p className="mt-3 font-mono text-sm leading-7 text-[#C8D0DC]">
                            {intelligence.scenario}
                        </p>
                    </div>
                </div>
            </motion.div>
        </aside>
    );
}

function MetricBlock({ icon: Icon, label, value }) {
    return (
        <div className="border border-[#202A3D] bg-[#121722] p-3">
            <div className="flex items-center justify-between text-[#7E8796]">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{label}</span>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="mt-3 font-mono text-2xl font-semibold text-[#E8EDF5]">{value}</div>
        </div>
    );
}

function RadarIcon() {
    return (
        <div className="relative h-6 w-6 rounded-full border border-[#D7B56D]">
            <motion.span
                className="absolute left-1/2 top-1/2 h-px w-3 origin-left bg-[#D7B56D]"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D7B56D]" />
        </div>
    );
}

export default function ArticlesShow({ article, related = [], glossary = {}, newsArticleSchema = null }) {
    const intelligence = buildIntelligence(article);
    const timestamp = article.tension?.updated_at || article.updated_at || article.published_at;

    return (
        <>
            <Head title={`${article.title} | Linea di gioco`}>
                {article.summary && <meta name="description" content={article.summary} />}
                {article.categories?.length > 0 && (
                    <meta name="keywords" content={article.categories.join(", ")} />
                )}
                {newsArticleSchema && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(newsArticleSchema),
                        }}
                    />
                )}
            </Head>
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

                    <header className="mt-6 border-b border-[#202A3D] pb-8">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`border px-3 py-1 font-mono text-xs uppercase tracking-[0.22em] ${intelligence.alertClasses}`}>
                                Allerta {intelligence.alertLevel}
                            </span>
                            <ArticleMeta topic={article.topic} publishedAt={article.published_at} />
                        </div>

                        <h1 className="mt-5 max-w-5xl font-serif text-4xl leading-tight text-[#F3F4F6] md:text-6xl">
                            {article.title}
                        </h1>

                        {article.summary && (
                            <p className="mt-6 max-w-3xl text-xl leading-8 text-[#AAB3C2]">
                                {article.summary}
                            </p>
                        )}

                        <div className="mt-8 grid overflow-hidden border border-[#202A3D] bg-[#101620] md:grid-cols-3">
                            <DataPill icon={MapPin} label="Coordinate" value={intelligence.coordinates} />
                            <DataPill icon={Clock3} label="Ultimo update" value={formatDateTime(timestamp)} />
                            <DataPill
                                icon={RadioTower}
                                label="Area"
                                value={article.tension?.region_name || article.topic || "Dossier globale"}
                            />
                        </div>

                    </header>

                    {article.cover_url && (
                        <div className="mt-8 overflow-hidden border border-[#202A3D] bg-[#0B0F15]">
                            <img src={article.cover_url} alt={article.title} className="h-[460px] w-full object-cover" />
                        </div>
                    )}

                    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_430px]">
                        <main className="min-w-0">
                            <div className="border-l border-[#2A354D] pl-5">
                                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                                    Briefing report
                                </p>
                            </div>
                            <div className="mt-2 text-lg">
                                {renderContent(article.content, glossary)}
                            </div>

                            {article.source_url && (
                                <a
                                    href={article.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-10 inline-flex items-center gap-2 border border-[#2A354D] bg-[#121722] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Fonte
                                </a>
                            )}
                        </main>

                        <IntelligenceSidebar article={article} intelligence={intelligence} />
                    </div>
                </article>

                <section className="mt-16 border border-[#202A3D] bg-[#101620] p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#7E8796]">
                                Next actions
                            </p>
                            <h2 className="mt-2 font-serif text-3xl text-[#F3F4F6]">Prossimi step consigliati</h2>
                            <p className="mt-3 max-w-2xl text-[#AAB3C2]">
                                Incrociare questo dossier con fonti regionali, aggiornare gli score sugli assi critici e
                                monitorare gli articoli correlati per variazioni di contesto.
                            </p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10 text-[#D7B56D]">
                            <FileSearch className="h-5 w-5" />
                        </div>
                    </div>

                    {related.length > 0 && (
                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {related.map((item) => (
                                <RelatedItem key={item.id} article={item} />
                            ))}
                        </div>
                    )}
                </section>
                </Tooltip.Provider>
            </BlogLayout>
        </>
    );
}
