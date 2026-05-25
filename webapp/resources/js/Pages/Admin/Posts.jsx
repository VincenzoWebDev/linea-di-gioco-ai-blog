import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import PostsManagementCard from "@/Components/admin/posts/PostsManagementCard";
import CreateArticleModal from "@/Components/admin/posts/CreateArticleModal";
import EditArticleModal from "@/Components/admin/posts/EditArticleModal";
import { useCategoryPicker } from "@/hooks/admin/useCategoryPicker";
import { useFilePreview } from "@/hooks/admin/useFilePreview";
import { usePostsFilters } from "@/hooks/admin/usePostsFilters";
import {
    articleToEditFormData,
    emptyCreateForm,
    emptyEditForm,
} from "@/lib/admin/posts";

export default function Posts({
    auth,
    articles = { data: [], links: [] },
    filters = {},
    sort = { field: "id", direction: "desc" },
    categories = [],
}) {
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingArticle, setEditingArticle] = useState(null);
    const [imageTime, setImageTime] = useState(Date.now());

    const createForm = useForm(emptyCreateForm());
    const editForm = useForm(emptyEditForm());

    const createCategoryPicker = useCategoryPicker(createForm);
    const editCategoryPicker = useCategoryPicker(editForm);

    const createCoverPreview = useFilePreview(createForm.data.cover);
    const createThumbPreview = useFilePreview(createForm.data.thumb);
    const editCoverPreview = useFilePreview(editForm.data.cover);
    const editThumbPreview = useFilePreview(editForm.data.thumb);

    const { tableFilters, updateFilters, resetFilters, toggleSort, sortLabel } =
        usePostsFilters(filters, sort);

    const articleRows = useMemo(() => articles?.data || [], [articles]);
    const paginationLinks = useMemo(() => articles?.links || [], [articles]);

    const openEdit = (article) => {
        setEditingId(article.id);
        setEditingArticle(article);
        editCategoryPicker.reset();
        setImageTime(Date.now());
        editForm.setData(articleToEditFormData(article));
        setShowEdit(true);
    };

    const handleDelete = (article) => {
        if (!confirm(`Eliminare l'articolo "${article.title}"?`)) {
            return;
        }

        editForm.delete(route("admin.posts.destroy", article.id), {
            preserveScroll: true,
        });
    };

    const openCreate = () => {
        createCategoryPicker.reset();
        setShowCreate(true);
    };

    const handleCreateSubmit = (event) => {
        event.preventDefault();
        createForm.post(route("admin.posts.store"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowCreate(false);
                createForm.reset();
                createCategoryPicker.reset();
            },
        });
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        if (!editingId) {
            return;
        }

        editForm.post(route("admin.posts.update", editingId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowEdit(false);
                setEditingId(null);
                setEditingArticle(null);
                editCategoryPicker.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Articoli
                </h2>
            }
        >
            <Head title="Articoli" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PostsManagementCard
                        articles={articleRows}
                        paginationLinks={paginationLinks}
                        categories={categories}
                        filters={tableFilters}
                        onFilterChange={updateFilters}
                        onFilterReset={resetFilters}
                        onToggleSort={toggleSort}
                        sortLabel={sortLabel}
                        onCreateClick={openCreate}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <CreateArticleModal
                show={showCreate}
                onClose={() => setShowCreate(false)}
                form={createForm}
                categories={categories}
                categoryPicker={createCategoryPicker}
                coverPreview={createCoverPreview}
                thumbPreview={createThumbPreview}
                onSubmit={handleCreateSubmit}
            />

            <EditArticleModal
                show={showEdit}
                onClose={() => setShowEdit(false)}
                form={editForm}
                article={editingArticle}
                categories={categories}
                categoryPicker={editCategoryPicker}
                coverPreview={editCoverPreview}
                thumbPreview={editThumbPreview}
                imageTime={imageTime}
                onSubmit={handleEditSubmit}
            />
        </AuthenticatedLayout>
    );
}
