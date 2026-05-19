import BlogLayout from "@/Layouts/BlogLayout";
import SeoHead from "@/Components/Seo/SeoHead";
import { Link } from "@inertiajs/react";

export default function Contact() {
    return (
        <BlogLayout>
            <SeoHead
                title="Contatti"
                description="Contatta il team di Linea di Gioco."
            />

            <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
                <h1 className="text-3xl font-bold text-white">Contatti</h1>

                <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
                    Per segnalazioni, richieste o informazioni Ã¨ possibile
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

                    <div className="text-xs text-zinc-500 mt-6">
                        Le richieste vengono valutate nel piÃ¹ breve tempo
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
    );
}
