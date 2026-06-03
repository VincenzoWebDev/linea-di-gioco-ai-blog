import { Clock3, MapPin, RadioTower } from "lucide-react";
import ArticleMeta from "@/Components/blog/articles/ArticleMeta";
import ArticleDataPill from "@/Components/blog/articles/show/ArticleDataPill";
import { formatDateTime } from "@/lib/blog/formatters";

export default function ArticleShowHeader({ article, intelligence }) {
    const timestamp =
        article.tension?.updated_at ||
        article.updated_at ||
        article.published_at;

    return (
        <header className="mt-6 border-b border-[#202A3D] pb-8">
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className={`border px-3 py-1 font-mono text-xs uppercase tracking-[0.22em] ${intelligence.alertClasses}`}
                >
                    Allerta {intelligence.alertLevel}
                </span>
                <ArticleMeta
                    topic={article.topic}
                    publishedAt={article.published_at}
                />
            </div>

            <h1 className="mt-5 max-w-5xl font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-6xl">
                {article.title}
            </h1>

            {article.summary && (
                <p className="mt-4 max-w-3xl text-lg leading-8 text-[#AAB3C2] sm:mt-6 sm:text-xl">
                    {article.summary}
                </p>
            )}

            <div className="mt-6 grid overflow-hidden border border-[#202A3D] bg-[#101620] sm:mt-8 sm:grid-cols-3">
                <ArticleDataPill
                    icon={MapPin}
                    label="Coordinate"
                    value={intelligence.coordinates}
                />
                <ArticleDataPill
                    icon={Clock3}
                    label="Ultimo aggiornamento"
                    value={formatDateTime(timestamp)}
                />
                <ArticleDataPill
                    icon={RadioTower}
                    label="Area"
                    value={
                        article.tension?.display_region_name ||
                        article.tension?.region_name ||
                        article.topic ||
                        "Dossier globale"
                    }
                />
            </div>
        </header>
    );
}
