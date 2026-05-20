export default function ArticleShowCover({ article }) {
    if (!article.cover_url) {
        return null;
    }

    return (
        <div className="mt-8 overflow-hidden border border-[#202A3D] bg-[#0B0F15]">
            <img
                src={article.cover_url}
                alt={article.title}
                className="h-52 w-full object-cover sm:h-72 md:h-[460px]"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                sizes="(min-width: 768px) 1200px, 100vw"
                width={1200}
                height={630}
            />
        </div>
    );
}
