export default function PostsFilters({
    filters,
    categories = [],
    onChange,
    onReset,
}) {
    return (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                placeholder="Cerca (titolo, slug, id)"
                value={filters.q}
                onChange={(e) => onChange({ q: e.target.value }, { debounce: true })}
            />
            <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) => onChange({ status: e.target.value })}
            >
                <option value="">Stato: tutti</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
            </select>
            <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={filters.created_by}
                onChange={(e) => onChange({ created_by: e.target.value })}
            >
                <option value="">Creato da: tutti</option>
                <option value="admin">admin</option>
                <option value="ai">ai</option>
            </select>
            <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={filters.publication}
                onChange={(e) => onChange({ publication: e.target.value })}
            >
                <option value="">Pubblicazione: tutte</option>
                <option value="published">Pubblicati</option>
                <option value="unpublished">Non pubblicati</option>
            </select>
            <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={filters.category_ids || ""}
                onChange={(e) => onChange({ category_ids: e.target.value })}
            >
                <option value="">Categorie: tutte</option>
                {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                        {category.name}
                    </option>
                ))}
            </select>
            <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={filters.per_page}
                onChange={(e) => onChange({ per_page: e.target.value })}
            >
                <option value="10">10 / pagina</option>
                <option value="15">15 / pagina</option>
                <option value="25">25 / pagina</option>
                <option value="50">50 / pagina</option>
            </select>
            <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-6">
                <button
                    type="button"
                    onClick={onReset}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
