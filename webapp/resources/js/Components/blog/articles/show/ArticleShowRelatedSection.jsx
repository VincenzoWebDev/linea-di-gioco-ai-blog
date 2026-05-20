import { FileSearch } from "lucide-react";
import ArticleRelatedCard from "@/Components/blog/articles/show/ArticleRelatedCard";

export default function ArticleShowRelatedSection({ related = [] }) {
    return (
        <section className="mt-12 border border-[#202A3D] bg-[#101620] p-4 sm:mt-16 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#7E8796]">
                        Prossimi passaggi
                    </p>
                    <h2 className="mt-2 font-serif text-3xl text-[#F3F4F6]">
                        Prossimi step consigliati
                    </h2>
                    <p className="mt-3 max-w-2xl text-[#AAB3C2]">
                        Incrociare questo dossier con fonti regionali,
                        aggiornare gli score sugli assi critici e monitorare
                        gli articoli correlati per variazioni di contesto.
                    </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10 text-[#D7B56D]">
                    <FileSearch className="h-5 w-5" />
                </div>
            </div>

            {related.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {related.map((item) => (
                        <ArticleRelatedCard key={item.id} article={item} />
                    ))}
                </div>
            )}
        </section>
    );
}
