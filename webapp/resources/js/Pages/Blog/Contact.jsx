import BlogLayout from "@/Layouts/BlogLayout";
import SeoHead from "@/Components/Seo/SeoHead";
import { Link } from "@inertiajs/react";

export default function Contact() {
    const canonicalUrl = route("contact");
    const description =
        "Contatta la redazione di Linea di Gioco per segnalazioni, richieste e comunicazioni editoriali.";

    return (
        <>
            <SeoHead
                title="Contatti"
                description={description}
                canonicalUrl={canonicalUrl}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    name: "Contatti Linea di Gioco",
                    url: canonicalUrl,
                    inLanguage: "it-IT",
                    description,
                }}
            />
            <BlogLayout>
                <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
                    <h1 className="text-3xl font-bold text-white">Contatti</h1>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                        Per segnalazioni, richieste o informazioni e possibile
                        contattare la redazione tramite email.
                    </p>

                    <div className="mt-8 space-y-4 text-sm">
                        <div>
                            <p className="text-zinc-400">Email</p>
                            <a
                                href="mailto:vincenzo.dev.97@gmail.com"
                                className="text-white hover:underline"
                            >
                                vincenzo.dev.97@gmail.com
                            </a>
                        </div>

                        <div className="mt-6 text-xs text-zinc-500">
                            Le richieste vengono valutate nel piu breve tempo
                            possibile.
                        </div>
                    </div>

                    <div className="mt-10 text-xs text-zinc-400">
                        <Link
                            href={route("privacy-policy")}
                            className="hover:text-white"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </BlogLayout>
        </>
    );
}
