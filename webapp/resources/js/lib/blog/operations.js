export function resolveLcpImageUrl(item) {
    if (!item) {
        return null;
    }

    return (
        item.thumb_url ||
        item.article?.thumb_url ||
        item.cover_url ||
        item.article?.cover_url ||
        null
    );
}
