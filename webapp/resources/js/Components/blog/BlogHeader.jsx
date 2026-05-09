import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Menu, X } from "lucide-react";

export default function BlogHeader() {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { label: "Home", href: route("home"), active: route().current("home") },
        {
            label: "Articoli",
            href: route("blog.articles.index"),
            active: route().current("blog.articles.*"),
        },
    ];

    return (
        <header className="border-b border-[#1C2333]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1C2333] bg-[#131823] text-[#E5E7EB]">
                        L
                    </div>
                    <div>
                        <div className="font-serif text-lg">Linea di gioco</div>
                        <div className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                            Geopolitica
                        </div>
                    </div>
                </Link>
                <nav className="hidden items-center gap-6 text-sm text-[#9CA3AF] md:flex">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`transition ${
                                item.active ? "text-[#E5E7EB]" : "text-[#9CA3AF] hover:text-[#E5E7EB]"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        href={route("newsletter")}
                        className="rounded-full border border-[#1C2333] px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#9CA3AF] transition hover:border-[#1F3A5F] hover:text-[#E5E7EB]"
                    >
                        Newsletter
                    </Link>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1C2333] bg-[#131823] text-[#9CA3AF] transition hover:text-[#E5E7EB] md:hidden"
                    aria-label="Apri menu"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            <div
                className={`border-t border-[#1C2333] bg-[#131823] px-6 py-4 md:hidden ${
                    isOpen ? "block" : "hidden"
                }`}
            >
                <nav className="flex flex-col gap-3">
                    {menuItems.map((item) => (
                        <Link
                            key={`mobile-${item.label}`}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`rounded-md px-3 py-2 text-sm transition ${
                                item.active
                                    ? "bg-[#1C2333] text-[#E5E7EB]"
                                    : "text-[#9CA3AF] hover:bg-[#171E2B] hover:text-[#E5E7EB]"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <Link
                    href={route("newsletter")}
                    onClick={() => setIsOpen(false)}
                    className="mt-4 block w-full rounded-full border border-[#1C2333] px-4 py-2 text-center text-xs uppercase tracking-[0.25em] text-[#9CA3AF] transition hover:border-[#1F3A5F] hover:text-[#E5E7EB]"
                >
                    Newsletter
                </Link>
            </div>
        </header>
    );
}
