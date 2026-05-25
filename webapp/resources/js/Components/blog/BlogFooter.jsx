import { Link } from "@inertiajs/react";

export default function BlogFooter() {
    return (
        <footer className="border-t border-[#1C2333]">
            <div className="mx-auto z-10 relative flex max-w-6xl flex-col gap-8 px-6 py-10 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="font-serif text-base text-[#E5E7EB]">
                        Linea di gioco
                    </div>

                    <div>Osservatorio geopolitico e strategico.</div>

                    <div className="max-w-md text-xs leading-relaxed text-[#4B5563]">
                        Le notizie riportate sono rielaborazioni e sintesi
                        basate su fonti pubbliche e testate giornalistiche
                        esterne.
                    </div>

                    <div className="pt-2 text-xs text-[#4B5563]">
                        © {new Date().getFullYear()} Linea di Gioco. Tutti i
                        diritti riservati.
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em]">
                    <Link
                        href={route("home")}
                        className="transition hover:text-[#E5E7EB]"
                    >
                        Home
                    </Link>

                    <Link
                        href={route("blog.articles.index")}
                        className="transition hover:text-[#E5E7EB]"
                    >
                        Articoli
                    </Link>

                    <Link
                        href={route("contact")}
                        className="transition hover:text-[#E5E7EB]"
                    >
                        Contatti
                    </Link>

                    <Link
                        href={route("newsletter")}
                        className="transition hover:text-[#E5E7EB]"
                    >
                        Newsletter
                    </Link>

                    <Link
                        href={route("privacy-policy")}
                        className="transition hover:text-[#E5E7EB]"
                    >
                        Privacy
                    </Link>

                    <Link
                        href={route("cookie-policy")}
                        className="transition hover:text-[#E5E7EB]"
                    >
                        Cookie
                    </Link>
                </div>
            </div>
        </footer>
    );
}
