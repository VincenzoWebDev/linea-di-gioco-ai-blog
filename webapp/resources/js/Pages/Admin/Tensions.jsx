import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import TensionsStatsCard from "@/Components/admin/tensions/TensionsStatsCard";
import TensionsManagementCard from "@/Components/admin/tensions/TensionsManagementCard";
import CreateTensionModal from "@/Components/admin/tensions/CreateTensionModal";
import EditTensionModal from "@/Components/admin/tensions/EditTensionModal";
import { useTensionsSearch } from "@/hooks/admin/useTensionsSearch";
import {
    emptyEditTensionForm,
    emptyTensionForm,
    tensionToEditFormData,
} from "@/lib/admin/tensions";

export default function Tensions({
    auth,
    tensions = { data: [], links: [] },
    filters = {},
    articles = [],
    stats = {},
}) {
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const createForm = useForm(emptyTensionForm());
    const editForm = useForm(emptyEditTensionForm());

    const rows = useMemo(() => tensions?.data || [], [tensions]);
    const paginationLinks = useMemo(() => tensions?.links || [], [tensions]);
    const { initialQuery, onSearchChange } = useTensionsSearch(filters.q || "");

    const openEdit = (item) => {
        setEditingId(item.id);
        editForm.setData(tensionToEditFormData(item));
        setShowEdit(true);
    };

    const handleDelete = (item) => {
        if (!confirm(`Eliminare la tensione "${item.display_region_name || item.region_name}"?`)) {
            return;
        }

        editForm.delete(route("admin.tensions.destroy", item.id), {
            preserveScroll: true,
        });
    };

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setShowCreate(true);
    };

    const handleCreateSubmit = () => {
        createForm.post(route("admin.tensions.store"), {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreate(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = () => {
        if (!editingId) {
            return;
        }

        editForm.post(route("admin.tensions.update", editingId), {
            preserveScroll: true,
            onSuccess: () => {
                setShowEdit(false);
                setEditingId(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Tensioni
                </h2>
            }
        >
            <Head title="Tensioni" />

            <div className="space-y-6">
                <TensionsStatsCard stats={stats} />
                <TensionsManagementCard
                    tensions={rows}
                    paginationLinks={paginationLinks}
                    searchQuery={initialQuery}
                    onSearchChange={onSearchChange}
                    onCreateClick={openCreate}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                />
            </div>

            <CreateTensionModal
                show={showCreate}
                onClose={() => setShowCreate(false)}
                form={createForm}
                articles={articles}
                onSubmit={handleCreateSubmit}
            />

            <EditTensionModal
                show={showEdit}
                onClose={() => setShowEdit(false)}
                form={editForm}
                articles={articles}
                onSubmit={handleEditSubmit}
            />
        </AuthenticatedLayout>
    );
}
