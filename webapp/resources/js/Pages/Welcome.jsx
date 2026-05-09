import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Newspaper, Sparkles } from "lucide-react";
import BlogLayout from "@/Layouts/BlogLayout";
import FeaturedCard from "@/Components/blog/FeaturedCard";
import ArticleCard from "@/Components/blog/articles/ArticleCard";

function formatDate(value) {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function Welcome({
    featuredArticle = null,
    spotlightArticle = null,
    latestArticles = [],
    briefingArticles = [],
    stats = {},
}) {
    const statItems = [
        {
            label: "Analisi pubblicate",
            value: stats.articlesCount || 0,
        },
        {
            label: "Aree tematiche",
            value: stats.categoriesCount || 0,
        },
        {
            label: "Ultimo aggiornamento",
            value: formatDate(stats.latestPublishedAt) || "In arrivo",
        },
    ];

    return (
        <>
            <Head title="Linea di gioco" />
            <BlogLayout>
                <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                    <div className="relative">
                        <div className="absolute -left-4 top-3 hidden h-24 w-24 rounded-full bg-[#9E2A2B]/10 blur-3xl sm:block" />
                        <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">
                            Osservatorio geopolitico
                        </p>
                        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#E5E7EB] sm:text-5xl">
                            Un blog strategico costruito per leggere rapidamente
                            gli snodi del nuovo ordine globale.
                        </h1>
                        <p className="mt-6 max-w-2xl text-[#9CA3AF]">
                            Approfondimenti, scenari e aggiornamenti ordinati
                            per priorita. La home ora porta subito ai contenuti
                            piu recenti e ai percorsi di lettura utili.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href={route("blog.articles.index")}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1F3A5F] px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#23456f]"
                            >
                                Tutti gli articoli
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {statItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-[#1C2333] bg-[#131823]/80 p-4 backdrop-blur"
                                >
                                    <div className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                                        {item.label}
                                    </div>
                                    <div className="mt-2 text-lg font-semibold text-[#E5E7EB]">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {spotlightArticle ? (
                        <Link
                            href={route("blog.articles.show", {
                                id: spotlightArticle.id,
                                slug: spotlightArticle.slug,
                            })}
                            className="block rounded-[2rem] border border-[#1C2333] bg-gradient-to-br from-[#131823] via-[#151c28] to-[#1F3A5F]/35 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#2A354D]"
                        >
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                                <Sparkles className="h-4 w-4 text-[#9E2A2B]" />
                                Focus del giorno
                            </div>
                            <h2 className="mt-4 font-serif text-3xl leading-tight text-[#E5E7EB]">
                                {spotlightArticle.title}
                            </h2>
                            <p className="mt-4 text-[#9CA3AF]">
                                {spotlightArticle.excerpt}
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E5E7EB]">
                                Apri analisi
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </Link>
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-[#2A354D] bg-[#131823]/70 p-6">
                            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                                Focus del giorno
                            </p>
                            <h2 className="mt-4 font-serif text-2xl text-[#E5E7EB]">
                                La home si aggiornera automaticamente con gli ultimi articoli pubblicati.
                            </h2>
                            <p className="mt-4 text-[#9CA3AF]">
                                Appena saranno disponibili nuovi contenuti,
                                questa sezione mostrera subito il pezzo in evidenza.
                            </p>
                        </div>
                    )}
                </section>

                {featuredArticle ? (
                    <section className="mt-16">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                                    In primo piano
                                </p>
                                <h2 className="mt-2 font-serif text-3xl text-[#E5E7EB]">
                                    L'analisi da cui partire
                                </h2>
                            </div>
                            <Link
                                href={route("blog.articles.index")}
                                className="hidden text-sm text-[#9CA3AF] transition hover:text-[#E5E7EB] sm:inline-flex"
                            >
                                Vai all'archivio
                            </Link>
                        </div>
                        <FeaturedCard
                            title={featuredArticle.title}
                            description={featuredArticle.excerpt}
                            tag={featuredArticle.topic || "Scenario"}
                            meta={formatDate(featuredArticle.published_at) || "Pubblicato ora"}
                            href={route("blog.articles.show", {
                                id: featuredArticle.id,
                                slug: featuredArticle.slug,
                            })}
                        />
                    </section>
                ) : null}

                <section className="mt-16">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                                Ultime notizie
                            </p>
                            <h2 className="mt-2 font-serif text-3xl text-[#E5E7EB]">
                                Notizie recenti e accesso diretto agli articoli
                            </h2>
                        </div>
                        <Link
                            href={route("blog.articles.index")}
                            className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] transition hover:text-[#E5E7EB]"
                        >
                            Tutti gli articoli
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {latestArticles.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-3">
                            {latestArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-[#2A354D] bg-[#131823]/70 p-8 text-[#9CA3AF]">
                            Nessuna notizia pubblicata al momento. Quando arriveranno
                            nuovi articoli, compariranno qui in automatico.
                        </div>
                    )}
                </section>

                <section className="mt-16 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                    <div className="rounded-[2rem] border border-[#1C2333] bg-[#131823] p-6">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                            <Newspaper className="h-4 w-4 text-[#9E2A2B]" />
                            Briefing rapido
                        </div>
                        <h3 className="mt-4 font-serif text-2xl">Letture da aprire subito</h3>
                        <div className="mt-6 space-y-3">
                            {briefingArticles.length > 0 ? (
                                briefingArticles.map((article, index) => (
                                    <Link
                                        key={article.id}
                                        href={route("blog.articles.show", {
                                            id: article.id,
                                            slug: article.slug,
                                        })}
                                        className="flex items-start gap-4 rounded-2xl border border-transparent px-3 py-3 text-sm text-[#9CA3AF] transition hover:border-[#1C2333] hover:bg-[#0E1116] hover:text-[#E5E7EB]"
                                    >
                                        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1C2333] text-xs text-[#E5E7EB]">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1">{article.title}</span>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-[#9CA3AF]">
                                    Il briefing si popola appena vengono pubblicati i primi articoli.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-[#1C2333] bg-gradient-to-br from-[#131823] via-[#131823] to-[#1F3A5F]/40 p-8">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                            Newsletter
                        </p>
                        <h3 className="mt-4 font-serif text-3xl">
                            Ricevi l'analisi strategica ogni settimana.
                        </h3>
                        <p className="mt-4 max-w-xl text-[#9CA3AF]">
                            Insight curati su geopolitica, energia e sicurezza,
                            con un focus sulle aree di frizione.
                        </p>
                        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                            <div className="w-full rounded-full border border-[#1C2333] bg-[#0E1116] px-5 py-3 text-sm text-[#6B7280]">
                                Iscriviti da una pagina dedicata, pensata per una UX piu chiara.
                            </div>
                            <Link
                                href={route("newsletter")}
                                className="rounded-full bg-[#9E2A2B] px-6 py-3 text-center text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#b33435]"
                            >
                                Vai alla newsletter
                            </Link>
                        </div>
                    </div>
                </section>
            </BlogLayout>
        </>
    );
}
