import { Pencil, Trash2 } from "lucide-react";
import { STATUS_STYLES } from "@/lib/admin/posts";
import { formatDateSlash } from "@/lib/blog/formatters";

export default function PostsTableRow({ article, onEdit, onDelete }) {
    return (
        <tr className="border-b border-slate-100">
            <td className="py-4 pr-4 text-slate-600">{article.id}</td>
            <td className="py-4 pr-4">
                <div className="font-medium text-slate-900">{article.title}</div>
                <div className="text-xs text-slate-500">{article.slug}</div>
            </td>
            <td className="py-4 pr-4 text-slate-600">
                {Array.isArray(article.categories) && article.categories.length > 0
                    ? article.categories.map((category) => category.name).join(", ")
                    : "-"}
            </td>
            <td className="py-4 pr-4">
                <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_STYLES[article.status] || STATUS_STYLES.draft
                    }`}
                >
                    {article.status}
                </span>
            </td>
            <td className="py-4 pr-4 text-slate-600">
                {formatDateSlash(article.published_at)}
            </td>
            <td className="py-4 pr-4 text-slate-600">
                {formatDateSlash(article.created_at)}
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(article)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label="Modifica"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(article)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50"
                        aria-label="Elimina"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
