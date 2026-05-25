export const TREND_LABELS = {
    rising: "In crescita",
    falling: "In calo",
    stable: "Stabile",
};

export function emptyTensionForm() {
    return {
        region_name: "",
        risk_score: 50,
        trend_direction: "stable",
        status_label: "",
        featured_article_id: "",
        latitude: "",
        longitude: "",
    };
}

export function emptyEditTensionForm() {
    return {
        _method: "put",
        ...emptyTensionForm(),
    };
}

export function tensionToEditFormData(item) {
    return {
        _method: "put",
        region_name: item.region_name || "",
        risk_score: item.risk_score || 50,
        trend_direction: item.trend_direction || "stable",
        status_label: item.status_label || "",
        featured_article_id: item.featured_article_id
            ? String(item.featured_article_id)
            : "",
        latitude: item.latitude ?? "",
        longitude: item.longitude ?? "",
    };
}

export function articleOptionLabel(article) {
    const status = article.status ? ` (${article.status})` : "";

    return `${article.title}${status}`;
}
