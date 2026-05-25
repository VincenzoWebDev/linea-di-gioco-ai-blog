import TensionsTableRow from "@/Components/admin/tensions/TensionsTableRow";

export default function TensionsTable({ tensions = [], onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                    <tr className="text-left">
                        <th className="py-3 pr-4 font-medium">Regione</th>
                        <th className="py-3 pr-4 font-medium">Risk</th>
                        <th className="py-3 pr-4 font-medium">Trend</th>
                        <th className="py-3 pr-4 font-medium">Stato</th>
                        <th className="py-3 pr-4 font-medium">Articolo di riferimento</th>
                        <th className="py-3 pr-4 text-right font-medium">Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {tensions.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-6 text-slate-500">
                                Nessuna tensione.
                            </td>
                        </tr>
                    )}
                    {tensions.map((tension) => (
                        <TensionsTableRow
                            key={tension.id}
                            tension={tension}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
