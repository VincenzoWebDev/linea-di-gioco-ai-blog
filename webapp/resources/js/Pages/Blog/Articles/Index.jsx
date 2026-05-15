import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Clock3, FileSearch, MapPin } from "lucide-react";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleIntelligenceCard, {
    formatPublishedAt,
} from "@/Components/blog/articles/ArticleIntelligenceCard";

function buildArticleChips(article) {
    const chips = [];

    const topic =
        article.topic ||
        (Array.isArray(article.categories) ? article.categories[0] : null);

    if (topic) {
        chips.push({ icon: MapPin, value: topic });
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
                Non ci sono ancora dossier pubblicati. Torna presto per nuove analisi.
            </p>
        </div>
    );
}

export default function ArticlesIndex({ articles = [], stats = {} }) {
    const total = stats.total ?? articles.length;

    return (
        <>
            <Head title="Archivio dossier | Linea di gioco" />
            <BlogLayout>
                <section className="relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
                    <div className="relative p-5 lg:p-8">
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
                                <h1 className="mt-3 font-serif text-4xl leading-tight text-[#F3F4F6] md:text-5xl">
                                    File declassificati
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#AAB3C2]">
                                    Tutti i dossier geopolitici pubblicati: analisi su
                                    crisi, sicurezza, energia e equilibri internazionali.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]">
                                <FileSearch className="h-4 w-4 text-[#D7B56D]" />
                                {total} dossier
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    {articles.length > 0 ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {articles.map((article, index) => (
                                <ArticleIntelligenceCard
                                    key={article.id}
                                    article={article}
                                    index={index}
                                    chips={buildArticleChips(article)}
                                    ctaLabel="Apri dossier"
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyArchive />
                    )}
                </section>
            </BlogLayout>
        </>
    );
}
