import InputError from "@/Components/InputError";
import ArticleCategoryField from "@/Components/admin/posts/form/ArticleCategoryField";
import ArticleImageField from "@/Components/admin/posts/form/ArticleImageField";
export default function ArticleForm({
    form,
    categories = [],
    categoryPicker,
    coverPreview,
    thumbPreview,
    existingCoverUrl,
    existingThumbUrl,
    idPrefix = "article",
    submitLabel,
    onSubmit,
    onCancel,
}) {
    return (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-xs font-medium text-slate-600">Titolo</label>
                    <input
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        value={form.data.title}
                        onChange={(e) => form.setData("title", e.target.value)}
                    />
                    <InputError message={form.errors.title} className="mt-1" />
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600">Slug</label>
                    <input
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        value={form.data.slug}
                        onChange={(e) => form.setData("slug", e.target.value)}
                    />
                    <InputError message={form.errors.slug} className="mt-1" />
                </div>
            </div>
            <div>
                <label className="text-xs font-medium text-slate-600">Summary</label>
                <textarea
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    rows="3"
                    value={form.data.summary}
                    onChange={(e) => form.setData("summary", e.target.value)}
                />
                <InputError message={form.errors.summary} className="mt-1" />
            </div>
            <div>
                <label className="text-xs font-medium text-slate-600">Contenuto</label>
                <textarea
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    rows="6"
                    value={form.data.content}
                    onChange={(e) => form.setData("content", e.target.value)}
                />
                <InputError message={form.errors.content} className="mt-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <ArticleCategoryField
                    form={form}
                    categories={categories}
                    categoryToAdd={categoryPicker.categoryToAdd}
                    onCategoryToAddChange={categoryPicker.setCategoryToAdd}
                    onAdd={categoryPicker.add}
                    onRemove={categoryPicker.remove}
                    idPrefix={idPrefix}
                />
                <div>
                    <label className="text-xs font-medium text-slate-600">Stato</label>
                    <select
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        value={form.data.status}
                        onChange={(e) => form.setData("status", e.target.value)}
                    >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="published">Published</option>
                    </select>
                    <InputError message={form.errors.status} className="mt-1" />
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600">Pubblicato il</label>
                    <input
                        type="date"
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        value={form.data.published_at}
                        onChange={(e) => form.setData("published_at", e.target.value)}
                    />
                    <InputError message={form.errors.published_at} className="mt-1" />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <ArticleImageField
                    label="Cover"
                    fileName={form.data.cover?.name}
                    previewUrl={coverPreview}
                    existingUrl={existingCoverUrl}
                    error={form.errors.cover}
                    onChange={(e) => form.setData("cover", e.target.files[0])}
                />
                <ArticleImageField
                    label="Thumb"
                    fileName={form.data.thumb?.name}
                    previewUrl={thumbPreview}
                    existingUrl={existingThumbUrl}
                    error={form.errors.thumb}
                    onChange={(e) => form.setData("thumb", e.target.files[0])}
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
