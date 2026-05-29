import { Link } from "@inertiajs/react";
import { FileSearch, History, MapPin, Tags } from "lucide-react";
import ArticleRelatedCard from "@/Components/blog/articles/show/ArticleRelatedCard";

const linkGroups = [
    {
        key: "area",
        title: "Area geografica",
        description: "Dossier sulla stessa area o regione monitorata.",
        icon: MapPin,
    },
    {
        key: "previous",
        title: "Eventi precedenti",
        description: "Aggiornamenti utili per leggere l'evoluzione del dossier.",
        icon: History,
    },
    {
        key: "categories",
        title: "Temi collegati",
        description: "Analisi con categorie e interessi strategici affini.",
        icon: Tags,
    },
];

function InternalLinkGroup({ group, items = [] }) {
    const Icon = group.icon;

    if (!items.length) {
        return null;
    }

    return (
        <div className="border border-[#202A3D] bg-[#0B0F15] p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#D7B56D]/30 bg-[#D7B56D]/10 text-[#D7B56D]">
                    <Icon className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#F3F4F6]">
                        {group.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#7E8796]">
                        {group.description}
                    </p>
                </div>
            </div>
            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <Link
                        key={`${group.key}-${item.id}`}
                        href={route("blog.articles.show", {
                            id: item.id,
                            slug: item.slug,
                        })}
                        className="block border-l border-[#2A354D] pl-3 transition hover:border-[#D7B56D]"
                    >
                        <span className="line-clamp-2 text-sm font-semibold leading-5 text-[#E8EDF5]">
                            {item.title}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[#D7B56D]">
                            {item.match_reason}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function ArticleShowRelatedSection({
    related = [],
    internalLinks = {},
}) {
    const hasInternalLinks = linkGroups.some(
        (group) => internalLinks[group.key]?.length > 0,
    );

    return (
        <section className="mt-12 border border-[#202A3D] bg-[#101620] p-4 sm:mt-16 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#7E8796]">
                        Prossimi passaggi
                    </p>
                    <h2 className="mt-2 font-serif text-3xl text-[#F3F4F6]">
                        Prossimi step consigliati
                    </h2>
                    <p className="mt-3 max-w-2xl text-[#AAB3C2]">
                        Percorsi di lettura per collegare area geografica,
                        categorie strategiche ed eventi precedenti.
                    </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10 text-[#D7B56D]">
                    <FileSearch className="h-5 w-5" />
                </div>
            </div>

            {hasInternalLinks && (
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {linkGroups.map((group) => (
                        <InternalLinkGroup
                            key={group.key}
                            group={group}
                            items={internalLinks[group.key] || []}
                        />
                    ))}
                </div>
            )}

            {related.length > 0 ? (
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {related.map((item) => (
                        <ArticleRelatedCard key={item.id} article={item} />
                    ))}
                </div>
            ) : (
                <p className="mt-6 text-sm text-[#9CA3AF]">
                    Nessun dossier affine disponibile al momento.
                </p>
            )}
        </section>
    );
}
