import { Link, usePage } from "@inertiajs/react";

export default function BlogFooter() {
    const { seo } = usePage().props;
    const twitterSite = seo?.twitterSite;
    const twitterHandle = twitterSite ? twitterSite.replace("@", "") : null;

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

                    {twitterHandle && (
                        <div className="flex gap-4 pt-2">
                            <a
                                href={`https://x.com/${twitterHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6B7280] hover:text-[#E5E7EB] transition-colors"
                                aria-label="Seguici su X (Twitter)"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>
                    )}

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
