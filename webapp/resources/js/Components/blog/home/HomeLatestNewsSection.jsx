import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import OperationIntelligenceCard from "@/Components/blog/home/OperationIntelligenceCard";

function EmptyState() {
    return (
        <div className="border border-dashed border-[#2A354D] bg-[#101620] p-8 text-[#9CA3AF]">
            Nessuna notizia recente disponibile.
        </div>
    );
}

export default function HomeLatestNewsSection({ items = [] }) {
    return (
        <section className="mt-12 sm:mt-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                        Ultime notizie
                    </p>
                    <h2 className="mt-2 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl">
                        Ultimi aggiornamenti dal blog
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[#AAB3C2] sm:text-base">
                        Una sequenza editoriale lineare delle pubblicazioni più
                        recenti, utile per lettori e motori di ricerca.
                    </p>
                </div>
                <Link
                    href={route("blog.articles.index")}
                    className="inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]"
                >
                    Tutte le notizie
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {items.length > 0 ? (
                <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {items.slice(0, 3).map((item, index) => (
                        <OperationIntelligenceCard
                            key={`${item.id}-${item.operation_code}`}
                            item={item}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}
        </section>
    );
}
