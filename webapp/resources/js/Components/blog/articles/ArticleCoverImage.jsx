import { Image as ImageIcon } from "lucide-react";

export default function ArticleCoverImage({
    item,
    className = "",
    compact = false,
    alt,
}) {
    const imageUrl =
        item?.cover_url ||
        item?.thumb_url ||
        item?.article?.cover_url ||
        item?.article?.thumb_url;

    return (
        <div className={`relative overflow-hidden bg-[#0B0F15] ${className}`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={alt || item?.title || "Articolo"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(215,181,109,0.16),transparent_32%),linear-gradient(135deg,rgba(31,58,95,0.5),rgba(11,15,21,0.96)_58%,rgba(158,42,43,0.24))]">
                    <ImageIcon
                        className={
                            compact
                                ? "h-5 w-5 text-[#D7B56D]/70"
                                : "h-9 w-9 text-[#D7B56D]/70"
                        }
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B10]/86 via-transparent to-transparent" />
        </div>
    );
}
