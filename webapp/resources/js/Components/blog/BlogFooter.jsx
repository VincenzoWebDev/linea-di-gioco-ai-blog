import { Link } from "@inertiajs/react";

export default function BlogFooter() {
    return (
        <footer className="border-t border-[#1C2333]">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="font-serif text-base text-[#E5E7EB]">Linea di gioco</div>
                    <div>Osservatorio geopolitico e strategico.</div>
                </div>
                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em]">
                    <Link href={route("home")} className="transition hover:text-[#E5E7EB]">
                        Home
                    </Link>
                    <Link href={route("blog.articles.index")} className="transition hover:text-[#E5E7EB]">
                        Articoli
                    </Link>
                    <Link href={route("newsletter")} className="transition hover:text-[#E5E7EB]">
                        Newsletter
                    </Link>
                </div>
            </div>
        </footer>
    );
}
