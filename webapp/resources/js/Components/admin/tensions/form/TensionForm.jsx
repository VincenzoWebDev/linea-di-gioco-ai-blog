import { articleOptionLabel } from "@/lib/admin/tensions";
import TensionFormField from "@/Components/admin/tensions/form/TensionFormField";

const inputClassName =
    "mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm";

export default function TensionForm({
    form,
    articles = [],
    submitLabel = "Salva",
    onSubmit,
    onCancel,
}) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            className="mt-4 space-y-4"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <TensionFormField label="Regione" error={form.errors.region_name}>
                    <input
                        className={inputClassName}
                        value={form.data.region_name}
                        onChange={(e) => form.setData("region_name", e.target.value)}
                    />
                </TensionFormField>
                <TensionFormField
                    label="Nome parlante"
                    error={form.errors.display_region_name}
                >
                    <input
                        className={inputClassName}
                        value={form.data.display_region_name}
                        onChange={(e) =>
                            form.setData("display_region_name", e.target.value)
                        }
                        placeholder="Es. USA-Iran, Cina-Taiwan"
                    />
                </TensionFormField>
                <TensionFormField label="Risk score (1-100)" error={form.errors.risk_score}>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        className={inputClassName}
                        value={form.data.risk_score}
                        onChange={(e) => form.setData("risk_score", e.target.value)}
                    />
                </TensionFormField>
                <TensionFormField label="Trend" error={form.errors.trend_direction}>
                    <select
                        className={inputClassName}
                        value={form.data.trend_direction}
                        onChange={(e) =>
                            form.setData("trend_direction", e.target.value)
                        }
                    >
                        <option value="stable">Stabile</option>
                        <option value="rising">In crescita</option>
                        <option value="falling">In calo</option>
                    </select>
                </TensionFormField>
                <TensionFormField label="Etichetta stato" error={form.errors.status_label}>
                    <input
                        className={inputClassName}
                        value={form.data.status_label}
                        onChange={(e) => form.setData("status_label", e.target.value)}
                    />
                </TensionFormField>
                <TensionFormField
                    label="Articolo di riferimento"
                    error={form.errors.featured_article_id}
                >
                    <select
                        className={inputClassName}
                        value={form.data.featured_article_id}
                        onChange={(e) =>
                            form.setData("featured_article_id", e.target.value)
                        }
                        required
                    >
                        <option value="" disabled>
                            Seleziona un articolo
                        </option>
                        {articles.map((article) => (
                            <option key={article.id} value={String(article.id)}>
                                {articleOptionLabel(article)}
                            </option>
                        ))}
                    </select>
                </TensionFormField>
                <div className="grid grid-cols-2 gap-2">
                    <TensionFormField label="Latitudine" error={form.errors.latitude}>
                        <input
                            className={inputClassName}
                            value={form.data.latitude}
                            onChange={(e) => form.setData("latitude", e.target.value)}
                        />
                    </TensionFormField>
                    <TensionFormField label="Longitudine" error={form.errors.longitude}>
                        <input
                            className={inputClassName}
                            value={form.data.longitude}
                            onChange={(e) => form.setData("longitude", e.target.value)}
                        />
                    </TensionFormField>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600"
                    >
                        Annulla
                    </button>
                )}
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
