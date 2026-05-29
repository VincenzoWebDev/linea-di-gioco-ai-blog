import BlogLayout from "@/Layouts/BlogLayout";
import SeoHead from "@/Components/Seo/SeoHead";
import { Link } from "@inertiajs/react";

export default function About() {
    const canonicalUrl = route("about");
    const description =
        "Linea di Gioco è un blog di informazione geopolitica dedicato ad analisi, tensioni internazionali e principali sviluppi globali.";

    return (
        <>
            <SeoHead
                title="Chi Siamo"
                description={description}
                canonicalUrl={canonicalUrl}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "AboutPage",
                    name: "Chi Siamo - Linea di Gioco",
                    url: canonicalUrl,
                    inLanguage: "it-IT",
                    description,
                }}
            />

            <BlogLayout>
                <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
                    <h1 className="text-3xl font-bold text-white">Chi Siamo</h1>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                        Linea di Gioco è un progetto editoriale indipendente
                        dedicato all’informazione geopolitica e agli equilibri
                        internazionali.
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                        Il blog pubblica notizie, analisi e aggiornamenti sui
                        principali eventi globali, con particolare attenzione a
                        conflitti, diplomazia, sicurezza internazionale,
                        tensioni regionali ed evoluzioni strategiche tra Stati.
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                        I contenuti vengono rielaborati a scopo informativo ed
                        editoriale utilizzando fonti pubbliche e internazionali,
                        mantenendo uno stile sintetico, accessibile e orientato
                        alla comprensione dei fatti.
                    </p>

                    <div className="mt-10 flex gap-4 text-xs text-zinc-400">
                        <Link
                            href={route("privacy-policy")}
                            className="hover:text-white"
                        >
                            Privacy Policy
                        </Link>

                        <Link
                            href={route("contact")}
                            className="hover:text-white"
                        >
                            Contatti
                        </Link>
                    </div>
                </div>
            </BlogLayout>
        </>
    );
}
