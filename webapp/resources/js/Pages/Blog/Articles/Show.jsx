import { Head, Link } from "@inertiajs/react";
import BlogLayout from "@/Layouts/BlogLayout";
import ArticleMeta from "@/Components/blog/articles/ArticleMeta";

function RelatedItem({ article }) {
    return (
        <Link
            href={route("blog.articles.show", { id: article.id, slug: article.slug })}
            className="group grid grid-cols-[88px_1fr] gap-4 rounded-xl border border-[#1C2333] bg-[#131823] p-3 transition hover:border-[#2A354D]"
        >
            <div className="h-20 w-[88px] overflow-hidden rounded-md bg-[#0E1116]">
                {article.thumb_url ? (
                    <img src={article.thumb_url} alt={article.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#1F3A5F]/40 to-[#9E2A2B]/25" />
                )}
            </div>
            <div>
                <h4 className="font-serif text-lg leading-tight text-[#E5E7EB] group-hover:text-white">
                    {article.title}
                </h4>
                <div className="mt-2">
                    <ArticleMeta topic={article.topic} publishedAt={article.published_at} />
                </div>
            </div>
        </Link>
    );
}

export default function ArticlesShow({ article, related = [] }) {
    return (
        <>
            <Head title={`${article.title} | Linea di gioco`} />
            <BlogLayout>
                <article className="mx-auto max-w-4xl">
                    <Link
                        href={route("blog.articles.index")}
                        className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF] transition hover:text-[#E5E7EB]"
                    >
                        Torna agli articoli
                    </Link>

                    <h1 className="mt-5 font-serif text-5xl leading-tight text-[#E5E7EB]">{article.title}</h1>
                    <div className="mt-5">
                        <ArticleMeta topic={article.topic} publishedAt={article.published_at} />
                    </div>

                    {article.cover_url && (
                        <div className="mt-8 overflow-hidden rounded-2xl border border-[#1C2333]">
                            <img src={article.cover_url} alt={article.title} className="h-[420px] w-full object-cover" />
                        </div>
                    )}

                    {article.summary && (
                        <p className="mt-8 border-l-2 border-[#1F3A5F] pl-5 text-lg italic text-[#9CA3AF]">
                            {article.summary}
                        </p>
                    )}

                    <div className="mt-8 text-[#E5E7EB]">
                        <p className="whitespace-pre-line leading-[1.9]">{article.content}</p>
                    </div>
                </article>

                {related.length > 0 && (
                    <section className="mx-auto mt-16 max-w-4xl">
                        <h2 className="font-serif text-3xl text-[#E5E7EB]">Articoli correlati</h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {related.map((item) => (
                                <RelatedItem key={item.id} article={item} />
                            ))}
                        </div>
                    </section>
                )}
            </BlogLayout>
        </>
    );
}
