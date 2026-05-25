import PostsTableRow from "@/Components/admin/posts/PostsTableRow";

export default function PostsTable({
    articles = [],
    onEdit,
    onDelete,
    onToggleSort,
    sortLabel,
}) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                    <tr className="text-left">
                        <th className="py-3 pr-4 font-medium">
                            <button type="button" onClick={() => onToggleSort("id")}>
                                ID{sortLabel("id")}
                            </button>
                        </th>
                        <th className="py-3 pr-4 font-medium">
                            <button type="button" onClick={() => onToggleSort("title")}>
                                Titolo{sortLabel("title")}
                            </button>
                        </th>
                        <th className="py-3 pr-4 font-medium">Categorie</th>
                        <th className="py-3 pr-4 font-medium">
                            <button type="button" onClick={() => onToggleSort("status")}>
                                Stato{sortLabel("status")}
                            </button>
                        </th>
                        <th className="py-3 pr-4 font-medium">
                            <button
                                type="button"
                                onClick={() => onToggleSort("published_at")}
                            >
                                Pubblicazione{sortLabel("published_at")}
                            </button>
                        </th>
                        <th className="py-3 pr-4 font-medium">
                            <button type="button" onClick={() => onToggleSort("created_at")}>
                                Creato il{sortLabel("created_at")}
                            </button>
                        </th>
                        <th className="py-3 pr-4 text-right font-medium">Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.length === 0 && (
                        <tr>
                            <td className="py-6 text-slate-500" colSpan="7">
                                Nessun articolo presente.
                            </td>
                        </tr>
                    )}
                    {articles.map((article) => (
                        <PostsTableRow
                            key={article.id}
                            article={article}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
