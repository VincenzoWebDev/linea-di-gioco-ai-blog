import { Image as ImageIcon } from "lucide-react";

const THUMB_DIMENSIONS = { width: 384, height: 384 };
const COVER_DIMENSIONS = { width: 1200, height: 630 };

function resolveImageUrl(item, variant) {
    const thumb =
        item?.thumb_url ||
        item?.article?.thumb_url ||
        null;
    const cover =
        item?.cover_url ||
        item?.article?.cover_url ||
        null;

    if (variant === "cover") {
        return cover || thumb;
    }

    return thumb || cover;
}

export default function ArticleCoverImage({
    item,
    className = "",
    compact = false,
    alt,
    variant = "thumb",
    loading = "lazy",
    fetchPriority = "auto",
    sizes,
    width,
    height,
    decoding = "async",
}) {
    const imageUrl = resolveImageUrl(item, variant);
    const defaults =
        variant === "cover" ? COVER_DIMENSIONS : THUMB_DIMENSIONS;
    const resolvedWidth = width ?? defaults.width;
    const resolvedHeight = height ?? defaults.height;

    return (
        <div className={`relative overflow-hidden bg-[#0B0F15] ${className}`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={alt || item?.title || "Articolo"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading={loading}
                    fetchpriority={fetchPriority}
                    sizes={sizes}
                    width={resolvedWidth}
                    height={resolvedHeight}
                    decoding={decoding}
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
