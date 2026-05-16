import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import ArticleCoverImage from "@/Components/blog/articles/ArticleCoverImage";

function DataChip({ icon: Icon, value }) {
    return (
        <span className="inline-flex max-w-full items-center gap-2 border border-[#202A3D] bg-[#0B0F15] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#9CA3AF]">
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#D7B56D]" />
            <span className="truncate">{value}</span>
        </span>
    );
}

export function formatPublishedAt(value) {
    if (!value) {
        return "Data n.d.";
    }

    return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

/**
 * @param {object} props
 * @param {object} props.article
 * @param {number} [props.index]
 * @param {string} [props.href]
 * @param {string} [props.ctaLabel]
 * @param {{ icon: import("lucide-react").LucideIcon, value: string }[]} [props.chips]
 * @param {{ label: string, border: string, bg: string, text: string } | null} [props.statusBadge]
 */
export default function ArticleIntelligenceCard({
    article,
    index = 0,
    href,
    ctaLabel = "Leggi dossier",
    chips = [],
    statusBadge = null,
}) {
    const targetHref =
        href ||
        route("blog.articles.show", {
            id: article.id,
            slug: article.slug,
        });

    const operationCode =
        article.operation_code || `OP-${String(article.id).padStart(4, "0")}`;

    const summary =
        article.summary || article.excerpt || "Briefing in aggiornamento automatico.";

    const revealDelay = Math.min(index * 60, 300);

    return (
        <article
            className="group min-w-0 max-w-full opacity-0 animate-card-reveal overflow-hidden border border-[#202A3D] bg-[#101620] transition-[border-color,box-shadow] duration-300 hover:border-[#D7B56D]/50 hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] motion-reduce:animate-none motion-reduce:opacity-100"
            style={{ animationDelay: `${revealDelay}ms` }}
        >
            <div className="transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-1">
                <Link href={targetHref} className="block">
                    <div className="relative">
                        <ArticleCoverImage
                            item={article}
                            className="h-48 border-b border-[#202A3D]"
                        />
                        <div className="absolute bottom-3 left-3 right-3 flex min-w-0 items-center justify-between gap-2">
                            <span className="min-w-0 truncate border border-[#D7B56D]/40 bg-[#080B10]/82 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FDE68A] backdrop-blur sm:text-[11px] sm:tracking-[0.22em]">
                                {operationCode}
                            </span>
                            {statusBadge ? (
                                <span
                                    className={`shrink-0 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur sm:tracking-[0.18em] ${statusBadge.border} ${statusBadge.bg} ${statusBadge.text}`}
                                >
                                    {statusBadge.label}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="p-4 sm:p-5">
                        <h3 className="text-lg font-semibold leading-tight text-[#F3F4F6] sm:text-xl">
                            {article.title}
                        </h3>

                        {chips.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {chips.map((chip, chipIndex) => (
                                    <DataChip
                                        key={`${chip.value}-${chipIndex}`}
                                        icon={chip.icon}
                                        value={chip.value}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-4 min-w-0">
                            <p className="line-clamp-3 text-sm leading-6 text-[#AAB3C2]">
                                {summary}
                            </p>
                            <div className="mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#D7B56D]">
                                {ctaLabel}
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </article>
    );
}
