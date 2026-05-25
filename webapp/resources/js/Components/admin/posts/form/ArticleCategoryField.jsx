import InputError from "@/Components/InputError";

export default function ArticleCategoryField({
    form,
    categories = [],
    categoryToAdd,
    onCategoryToAddChange,
    onAdd,
    onRemove,
    idPrefix = "article",
}) {
    const selectedIds = form.data.category_ids || [];

    return (
        <div>
            <label className="text-xs font-medium text-slate-600">Categorie</label>
            <div className="mt-2 flex items-center gap-2">
                <select
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    value={categoryToAdd}
                    onChange={(e) => onCategoryToAddChange(e.target.value)}
                >
                    <option value="">Seleziona categoria</option>
                    {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={onAdd}
                    className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                >
                    Aggiungi
                </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {selectedIds.map((categoryId) => {
                    const category = categories.find(
                        (item) => String(item.id) === String(categoryId)
                    );

                    return (
                        <button
                            type="button"
                            key={`${idPrefix}-cat-${categoryId}`}
                            onClick={() => onRemove(categoryId)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
                        >
                            {(category?.name || `ID ${categoryId}`)} ×
                        </button>
                    );
                })}
            </div>
            <InputError message={form.errors.category_ids} className="mt-1" />
        </div>
    );
}
