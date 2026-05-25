export const STATUS_STYLES = {
    draft: "bg-slate-100 text-slate-700",
    review: "bg-amber-100 text-amber-700",
    published: "bg-emerald-100 text-emerald-700",
};

export const DEFAULT_POST_FILTERS = {
    q: "",
    status: "",
    created_by: "",
    publication: "",
    category_ids: "",
    per_page: "15",
};

export function filtersFromProps(filters = {}) {
    return {
        q: filters.q || "",
        status: filters.status || "",
        created_by: filters.created_by || "",
        publication: filters.publication || "",
        category_ids: filters.category_ids || "",
        per_page: String(filters.per_page || 15),
    };
}

export function emptyCreateForm() {
    return {
        title: "",
        slug: "",
        summary: "",
        content: "",
        category_ids: [],
        status: "draft",
        published_at: "",
        cover: null,
        thumb: null,
    };
}

export function emptyEditForm() {
    return {
        id: null,
        _method: "put",
        ...emptyCreateForm(),
    };
}

export function articleToEditFormData(article) {
    return {
        id: article.id,
        _method: "put",
        title: article.title || "",
        slug: article.slug || "",
        summary: article.summary || "",
        content: article.content || "",
        category_ids: Array.isArray(article.categories)
            ? article.categories.map((category) => String(category.id))
            : [],
        status: article.status || "draft",
        published_at: article.published_at ? article.published_at.slice(0, 10) : "",
        cover: null,
        thumb: null,
    };
}

export function storageUrl(path, time = null) {
    if (!path) {
        return null;
    }

    return time ? `/storage/${path}?t=${time}` : `/storage/${path}`;
}
