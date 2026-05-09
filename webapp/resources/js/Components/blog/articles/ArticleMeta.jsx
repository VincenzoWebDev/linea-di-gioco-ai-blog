export default function ArticleMeta({ topic, publishedAt }) {
    const dateLabel = publishedAt ? new Date(publishedAt).toLocaleDateString("it-IT") : null;

    return (
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#6B7280]">
            {topic && <span>{topic}</span>}
            {topic && dateLabel && <span className="h-1 w-1 rounded-full bg-[#1C2333]" />}
            {dateLabel && <span>{dateLabel}</span>}
        </div>
    );
}
