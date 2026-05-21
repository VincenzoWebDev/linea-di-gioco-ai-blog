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

export function normalizeOperations(locations = [], articles = []) {
    if (locations.length > 0) {
        return locations.map((location) => ({
            ...location,
            title: location.article?.title || location.region_name,
            summary: location.article?.summary || location.status_label,
            url: location.article?.url || null,
            published_at:
                location.article?.published_at || location.updated_at,
            thumb_url:
                location.article?.thumb_url ||
                location.article?.cover_url ||
                null,
            cover_url:
                location.article?.cover_url ||
                location.article?.thumb_url ||
                null,
        }));
    }

    return articles.map((article) => ({
        ...article,
        title: article.title,
        summary: article.excerpt || article.summary,
        url: route("blog.articles.show", {
            id: article.id,
            slug: article.slug,
        }),
        region_name: article.topic || "Dossier globale",
        risk_score: article.current_tension ?? article.risk_score ?? 38,
        severity: article.severity || "low",
        trend_direction: article.trend_direction || "stable",
        operation_code:
            article.operation_code ||
            `OP-${String(article.id).padStart(4, "0")}`,
        article,
        thumb_url: article.thumb_url || article.cover_url || null,
        cover_url: article.cover_url || article.thumb_url || null,
    }));
}
