import { Link } from "@inertiajs/react";
import { ArrowRight, Mail, Newspaper, ShieldCheck } from "lucide-react";
import BlogLayout from "@/Layouts/BlogLayout";
import SeoHead from "@/Components/Seo/SeoHead";

export default function Newsletter({ stats = {} }) {
    const items = [
        {
            icon: Newspaper,
            title: "Selezione editoriale",
            description:
                "Una raccolta delle analisi più rilevanti dal blog, senza contenuti superflui.",
        },
        {
            icon: ShieldCheck,
            title: "Focus geopolitico",
            description:
                "Scenari internazionali, sicurezza e dinamiche strategiche spiegate in modo chiaro.",
        },
        {
            icon: Mail,
            title: "Formato essenziale",
            description:
                "Un riepilogo diretto, pensato per chi vuole restare aggiornato senza rumore informativo.",
        },
    ];

    const description =
        "Newsletter di Linea di gioco: analisi geopolitiche e scenari internazionali selezionati.";

    return (
        <>
            <SeoHead
                title="Newsletter geopolitica"
                description={description}
                canonicalUrl={route("newsletter")}
                keywords={[
                    "newsletter geopolitica",
                    "analisi geopolitiche",
                    "scenari internazionali",
                    "geopolitica newsletter",
                ]}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    name: "Newsletter Linea di gioco",
                    url: route("newsletter"),
                    inLanguage: "it-IT",
                    description,
                }}
            />

            <BlogLayout>
                <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">
                            Newsletter
                        </p>

                        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#E5E7EB] sm:text-5xl">
                            Uno spazio dedicato agli aggiornamenti geopolitici
                            essenziali.
                        </h1>

                        <p className="mt-6 max-w-2xl text-[#9CA3AF]">
                            La newsletter non è ancora attiva. Stiamo
                            completando il sistema di invio e gestione delle
                            iscrizioni per garantire affidabilità e conformità.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href={route("blog.articles.index")}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1F3A5F] px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#23456f]"
                            >
                                Esplora il blog
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href={route("home")}
                                className="rounded-full border border-[#1C2333] px-6 py-3 text-sm uppercase tracking-[0.2em] text-[#9CA3AF] transition hover:border-[#9E2A2B] hover:text-[#E5E7EB]"
                            >
                                Torna alla home
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[#1C2333] bg-gradient-to-br from-[#131823] via-[#151c28] to-[#1F3A5F]/35 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                            Iscrizione
                        </p>

                        <h2 className="mt-4 font-serif text-3xl text-[#E5E7EB]">
                            Newsletter in arrivo
                        </h2>

                        <p className="mt-4 text-[#9CA3AF]">
                            Stiamo preparando un sistema di iscrizione per
                            ricevere direttamente le analisi più rilevanti senza
                            rumore informativo.
                        </p>

                        <div className="mt-6 space-y-4 opacity-60">
                            <input
                                type="email"
                                disabled
                                placeholder="attivazione prossima..."
                                className="w-full cursor-not-allowed rounded-2xl border border-[#1C2333] bg-[#0E1116] px-5 py-4 text-sm text-[#6B7280]"
                            />

                            <button
                                type="button"
                                disabled
                                className="w-full cursor-not-allowed rounded-2xl bg-[#9E2A2B]/50 px-6 py-4 text-sm uppercase tracking-[0.2em] text-white"
                            >
                                Non ancora attiva
                            </button>

                            <p className="text-xs text-[#6B7280] text-center">
                                La funzione di iscrizione sarà disponibile a
                                breve.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#1C2333] bg-[#0E1116]/70 p-4">
                                <div className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                                    Articoli
                                </div>
                                <div className="mt-2 text-lg font-semibold text-[#E5E7EB]">
                                    {stats.articlesCount || 0}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#1C2333] bg-[#0E1116]/70 p-4">
                                <div className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                                    Categorie
                                </div>
                                <div className="mt-2 text-lg font-semibold text-[#E5E7EB]">
                                    {stats.categoriesCount || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-16 grid gap-6 lg:grid-cols-3">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                key={item.title}
                                className="rounded-[2rem] border border-[#1C2333] bg-[#131823] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
                            >
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1C2333] text-[#E5E7EB]">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className="mt-5 font-serif text-2xl text-[#E5E7EB]">
                                    {item.title}
                                </h3>

                                <p className="mt-3 text-[#9CA3AF]">
                                    {item.description}
                                </p>
                            </article>
                        );
                    })}
                </section>
            </BlogLayout>
        </>
    );
}
