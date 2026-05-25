import { Plus } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import AdminPagination from "@/Components/admin/shared/AdminPagination";
import TensionsTable from "@/Components/admin/tensions/TensionsTable";

export default function TensionsManagementCard({
    tensions = [],
    paginationLinks = [],
    searchQuery = "",
    onSearchChange,
    onCreateClick,
    onEdit,
    onDelete,
}) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Gestione tensioni</CardTitle>
                    <CardDescription>
                        CRUD per la barra tensioni del blog. Ogni tensione è collegata a un
                        articolo.
                    </CardDescription>
                </div>
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    Nuova tensione
                </button>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <input
                        key={searchQuery}
                        defaultValue={searchQuery}
                        placeholder="Cerca regione, stato o articolo"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <TensionsTable tensions={tensions} onEdit={onEdit} onDelete={onDelete} />
                <AdminPagination links={paginationLinks} />
            </CardContent>
        </Card>
    );
}
