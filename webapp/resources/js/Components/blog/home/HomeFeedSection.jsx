import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import OperationIntelligenceCard from "@/Components/blog/home/OperationIntelligenceCard";

function EmptyState() {
    return (
        <div className="border border-dashed border-[#2A354D] bg-[#101620] p-8 text-[#9CA3AF]">
            La sala operativa resta pronta per le prime analisi pubblicate.
        </div>
    );
}

export default function HomeFeedSection({ items }) {
    return (
        <section className="mt-12 sm:mt-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]">
                        Flusso analisi
                    </p>
                    <h2 className="mt-2 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl">
                        File declassificati
                    </h2>
                </div>
                <Link
                    href={route("blog.articles.index")}
                    className="inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]"
                >
                    Archivio completo
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {items.length > 0 ? (
                <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {items.slice(0, 6).map((item, index) => (
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
