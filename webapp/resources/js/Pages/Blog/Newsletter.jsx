import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Mail, Newspaper, ShieldCheck } from "lucide-react";
import BlogLayout from "@/Layouts/BlogLayout";

export default function Newsletter({ stats = {} }) {
    const items = [
        {
            icon: Newspaper,
            title: "Selezione ragionata",
            description: "Una sintesi delle analisi piu rilevanti senza dispersione.",
        },
        {
            icon: ShieldCheck,
            title: "Focus strategico",
            description: "Geopolitica, sicurezza, energia e aree di frizione lette con priorita chiare.",
        },
        {
            icon: Mail,
            title: "Formato semplice",
            description: "Un unico punto di accesso, piu ordinato rispetto a una CTA dentro la home.",
        },
    ];

    return (
        <>
            <Head title="Newsletter | Linea di gioco" />
            <BlogLayout>
                <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">
                            Newsletter
                        </p>
                        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#E5E7EB] sm:text-5xl">
                            Una pagina dedicata per iscriversi senza interrompere la navigazione del blog.
                        </h1>
                        <p className="mt-6 max-w-2xl text-[#9CA3AF]">
                            Ho separato il percorso newsletter dalla home per evitare comportamenti ambigui
                            di scroll e mantenere la UX piu pulita.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href={route("blog.articles.index")}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1F3A5F] px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#23456f]"
                            >
                                Leggi le ultime notizie
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
                            Lascia la tua email
                        </h2>
                        <p className="mt-4 text-[#9CA3AF]">
                            Per ora questa pagina prepara il flusso UX corretto. Il collegamento a un form reale
                            o a un provider email puo essere aggiunto nel prossimo passaggio.
                        </p>
                        <div className="mt-6 space-y-4">
                            <input
                                type="email"
                                aria-label="Email newsletter"
                                placeholder="nome@azienda.it"
                                className="w-full rounded-2xl border border-[#1C2333] bg-[#0E1116] px-5 py-4 text-sm text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#1F3A5F] focus:outline-none"
                            />
                            <button
                                type="button"
                                className="w-full rounded-2xl bg-[#9E2A2B] px-6 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#b33435]"
                            >
                                Iscrivimi
                            </button>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#1C2333] bg-[#0E1116]/70 p-4">
                                <div className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                                    Articoli pubblicati
                                </div>
                                <div className="mt-2 text-lg font-semibold text-[#E5E7EB]">
                                    {stats.articlesCount || 0}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-[#1C2333] bg-[#0E1116]/70 p-4">
                                <div className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">
                                    Aree tematiche
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
                                <p className="mt-3 text-[#9CA3AF]">{item.description}</p>
                            </article>
                        );
                    })}
                </section>
            </BlogLayout>
        </>
    );
}
