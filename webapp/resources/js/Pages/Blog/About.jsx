import BlogLayout from "@/Layouts/BlogLayout";
import SeoHead from "@/Components/Seo/SeoHead";
import { Link } from "@inertiajs/react";

export default function About() {
    const canonicalUrl = route("about");
    const description =
        "Linea di Gioco è un progetto editoriale dedicato all’analisi geopolitica globale, con focus su sicurezza internazionale, energia e intelligence open source.";

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
                        dedicato all’analisi della geopolitica globale. Il suo
                        obiettivo è offrire una lettura chiara e strutturata
                        degli eventi internazionali che influenzano gli
                        equilibri tra Stati e regioni del mondo.
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                        Il sistema editoriale combina automazione nella raccolta
                        e rielaborazione delle notizie con una supervisione
                        umana che verifica coerenza, rilevanza e qualità dei
                        contenuti prima della pubblicazione.
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                        Il focus del progetto riguarda geopolitica, sicurezza
                        internazionale, dinamiche energetiche e intelligence
                        open source (OSINT), con particolare attenzione ai
                        contesti di crisi e alle evoluzioni strategiche globali.
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                        Lo stile editoriale è pensato per essere informativo e
                        accessibile, evitando tecnicismi e mantenendo un taglio
                        giornalistico chiaro e diretto.
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
