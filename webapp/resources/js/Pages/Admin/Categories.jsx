import { useEffect, useMemo, useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import Modal from "@/Components/Modal";
import InputError from "@/Components/InputError";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function Categories({
    auth,
    categories = { data: [], links: [] },
    filters = {},
}) {
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState(filters.q || "");
    const debounceRef = useRef(null);

    const rows = useMemo(() => categories?.data || [], [categories]);
    const links = useMemo(() => categories?.links || [], [categories]);

    const createForm = useForm({
        name: "",
        slug: "",
        description: "",
        is_active: true,
    });

    const editForm = useForm({
        _method: "put",
        name: "",
        slug: "",
        description: "",
        is_active: true,
    });

    const applySearch = (q) => {
        router.get(
            route("admin.categories.index"),
            { q },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleSearchChange = (value) => {
        setSearch(value);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => applySearch(value), 300);
    };

    const openEdit = (category) => {
        setEditingId(category.id);
        editForm.setData({
            _method: "put",
            name: category.name || "",
            slug: category.slug || "",
            description: category.description || "",
            is_active: Boolean(category.is_active),
        });
        setShowEdit(true);
    };

    const handleDelete = (category) => {
        if (!confirm(`Eliminare la categoria "${category.name}"?`)) {
            return;
        }
        router.delete(route("admin.categories.destroy", category.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Categorie</h2>}
        >
            <Head title="Categorie" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Gestione categorie</CardTitle>
                                <CardDescription>Usate per classificare articoli manuali e AI.</CardDescription>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreate(true)}
                                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                <Plus className="h-4 w-4" />
                                Nuova categoria
                            </button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <input
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm sm:max-w-sm"
                                    placeholder="Cerca categoria..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="border-b border-slate-200 text-slate-500">
                                        <tr className="text-left">
                                            <th className="py-3 pr-4 font-medium">ID</th>
                                            <th className="py-3 pr-4 font-medium">Nome</th>
                                            <th className="py-3 pr-4 font-medium">Slug</th>
                                            <th className="py-3 pr-4 font-medium">Stato</th>
                                            <th className="py-3 pr-4 font-medium text-right">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 && (
                                            <tr>
                                                <td className="py-6 text-slate-500" colSpan="5">
                                                    Nessuna categoria presente.
                                                </td>
                                            </tr>
                                        )}
                                        {rows.map((category) => (
                                            <tr key={category.id} className="border-b border-slate-100">
                                                <td className="py-4 pr-4 text-slate-600">{category.id}</td>
                                                <td className="py-4 pr-4 text-slate-900 font-medium">{category.name}</td>
                                                <td className="py-4 pr-4 text-slate-600">{category.slug}</td>
                                                <td className="py-4 pr-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                            category.is_active
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {category.is_active ? "attiva" : "disattiva"}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(category)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                            aria-label="Modifica"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(category)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50"
                                                            aria-label="Elimina"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {links.length > 3 && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {links.map((link, idx) => {
                                        const label = link.label.replace("&laquo;", "«").replace("&raquo;", "»");
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={`${idx}-${label}`}
                                                    className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-400"
                                                >
                                                    {label}
                                                </span>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={`${idx}-${label}`}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className={`rounded-md border px-3 py-1 text-sm ${
                                                    link.active
                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                                {label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="lg">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Nuova categoria</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            createForm.post(route("admin.categories.store"), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setShowCreate(false);
                                    createForm.reset();
                                },
                            });
                        }}
                        className="mt-5 space-y-4"
                    >
                        <div>
                            <label className="text-xs font-medium text-slate-600">Nome</label>
                            <input
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData("name", e.target.value)}
                            />
                            <InputError message={createForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Slug (opzionale)</label>
                            <input
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={createForm.data.slug}
                                onChange={(e) => createForm.setData("slug", e.target.value)}
                            />
                            <InputError message={createForm.errors.slug} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Descrizione</label>
                            <textarea
                                rows="3"
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData("description", e.target.value)}
                            />
                            <InputError message={createForm.errors.description} className="mt-1" />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={createForm.data.is_active}
                                onChange={(e) => createForm.setData("is_active", e.target.checked)}
                            />
                            Categoria attiva
                        </label>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                            >
                                Salva
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showEdit} onClose={() => setShowEdit(false)} maxWidth="lg">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Modifica categoria</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!editingId) {
                                return;
                            }
                            editForm.post(route("admin.categories.update", editingId), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setShowEdit(false);
                                    setEditingId(null);
                                },
                            });
                        }}
                        className="mt-5 space-y-4"
                    >
                        <div>
                            <label className="text-xs font-medium text-slate-600">Nome</label>
                            <input
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData("name", e.target.value)}
                            />
                            <InputError message={editForm.errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Slug</label>
                            <input
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={editForm.data.slug}
                                onChange={(e) => editForm.setData("slug", e.target.value)}
                            />
                            <InputError message={editForm.errors.slug} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Descrizione</label>
                            <textarea
                                rows="3"
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData("description", e.target.value)}
                            />
                            <InputError message={editForm.errors.description} className="mt-1" />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={editForm.data.is_active}
                                onChange={(e) => editForm.setData("is_active", e.target.checked)}
                            />
                            Categoria attiva
                        </label>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowEdit(false)}
                                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                            >
                                Aggiorna
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

