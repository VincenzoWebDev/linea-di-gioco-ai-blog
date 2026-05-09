import { Head } from "@inertiajs/react";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleHero from "@/Components/blog/articles/ArticleHero";
import ArticleCard from "@/Components/blog/articles/ArticleCard";

export default function ArticlesIndex({ articles = [] }) {
    const [hero, ...list] = articles;

    return (
        <>
            <Head title="Articoli | Linea di gioco" />
            <BlogLayout>
                <section>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">Analisi</p>
                    <h1 className="mt-4 font-serif text-5xl leading-tight text-[#E5E7EB]">
                        Dossier e articoli geopolitici
                    </h1>
                    <p className="mt-5 max-w-3xl text-[#9CA3AF]">
                        Letture strategiche su equilibri internazionali, sicurezza, energia e aree di crisi.
                    </p>
                </section>

                <section className="mt-10">
                    {hero ? (
                        <ArticleHero article={hero} />
                    ) : (
                        <div className="rounded-2xl border border-[#1C2333] bg-[#131823] p-8 text-[#9CA3AF]">
                            Nessun articolo pubblicato al momento.
                        </div>
                    )}
                </section>

                {list.length > 0 && (
                    <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {list.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </section>
                )}
            </BlogLayout>
        </>
    );
}
