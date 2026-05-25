import InputError from "@/Components/InputError";

export default function ArticleImageField({
    label,
    fileName,
    previewUrl,
    existingUrl,
    error,
    onChange,
}) {
    const showPreview = previewUrl || existingUrl;

    return (
        <label className="group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {label}
                    </div>
                    <div className="mt-1 text-slate-700">
                        {fileName || "Seleziona immagine"}
                    </div>
                </div>
                <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300">
                    Carica
                </span>
            </div>
            {showPreview && (
                <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
                    <img
                        src={previewUrl || existingUrl}
                        alt={`Preview ${label.toLowerCase()}`}
                        className="h-32 w-full object-cover"
                    />
                </div>
            )}
            <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onChange}
            />
            <InputError message={error} className="mt-2" />
        </label>
    );
}
