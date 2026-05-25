import { Plus } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import AdminPagination from "@/Components/admin/shared/AdminPagination";
import PostsFilters from "@/Components/admin/posts/PostsFilters";
import PostsTable from "@/Components/admin/posts/PostsTable";

export default function PostsManagementCard({
    articles = [],
    paginationLinks = [],
    categories = [],
    filters,
    onFilterChange,
    onFilterReset,
    onToggleSort,
    sortLabel,
    onCreateClick,
    onEdit,
    onDelete,
}) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Gestione articoli</CardTitle>
                    <CardDescription>Lista articoli con stato editoriale.</CardDescription>
                </div>
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    Nuovo articolo
                </button>
            </CardHeader>
            <CardContent>
                <PostsFilters
                    filters={filters}
                    categories={categories}
                    onChange={onFilterChange}
                    onReset={onFilterReset}
                />
                <PostsTable
                    articles={articles}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleSort={onToggleSort}
                    sortLabel={sortLabel}
                />
                <AdminPagination links={paginationLinks} />
            </CardContent>
        </Card>
    );
}
