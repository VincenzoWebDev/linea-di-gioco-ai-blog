import { Pencil, Trash2 } from "lucide-react";
import { TREND_LABELS } from "@/lib/admin/tensions";

export default function TensionsTableRow({ tension, onEdit, onDelete }) {
    const trend =
        TREND_LABELS[tension.trend_direction] || TREND_LABELS.stable;

    return (
        <tr className="border-b border-slate-100">
            <td className="py-3 pr-4 font-medium text-slate-900">{tension.region_name}</td>
            <td className="py-3 pr-4 text-slate-600">{tension.risk_score}</td>
            <td className="py-3 pr-4 text-slate-600">{trend}</td>
            <td className="py-3 pr-4 text-slate-600">{tension.status_label}</td>
            <td className="py-3 pr-4">
                {tension.featured_article ? (
                    <div>
                        <p className="font-medium text-slate-800">
                            {tension.featured_article.title}
                        </p>
                        <p className="text-xs text-slate-500">
                            ID {tension.featured_article.id}
                            {tension.featured_article.status
                                ? ` • ${tension.featured_article.status}`
                                : ""}
                        </p>
                    </div>
                ) : (
                    <span className="text-slate-400">—</span>
                )}
            </td>
            <td className="py-3 pr-4">
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(tension)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label="Modifica tensione"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(tension)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50"
                        aria-label="Elimina tensione"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
