import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ArchivePagination({ articles }) {
    if (articles.last_page <= 1) {
        return null;
    }

    return (
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#7E8796]">
                Pagina {articles.current_page} di {articles.last_page}
            </div>

            <div className="flex items-center gap-3">
                {articles.prev_page_url ? (
                    <Link
                        href={articles.prev_page_url}
                        preserveScroll
                        className="inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 text-sm text-[#AAB3C2] transition hover:border-[#D7B56D] hover:text-[#D7B56D]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Precedente
                    </Link>
                ) : (
                    <div className="inline-flex cursor-not-allowed items-center gap-2 border border-[#1B2435] bg-[#0D121B] px-4 py-2 text-sm text-[#4B5563]">
                        <ChevronLeft className="h-4 w-4" />
                        Precedente
                    </div>
                )}

                {articles.next_page_url ? (
                    <Link
                        href={articles.next_page_url}
                        preserveScroll
                        className="inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 text-sm text-[#AAB3C2] transition hover:border-[#D7B56D] hover:text-[#D7B56D]"
                    >
                        Successiva
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <div className="inline-flex cursor-not-allowed items-center gap-2 border border-[#1B2435] bg-[#0D121B] px-4 py-2 text-sm text-[#4B5563]">
                        Successiva
                        <ChevronRight className="h-4 w-4" />
                    </div>
                )}
            </div>
        </div>
    );
}
