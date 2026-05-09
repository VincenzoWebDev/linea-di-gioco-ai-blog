import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const statusStyles = {
    draft: 'bg-slate-100 text-slate-700',
    review: 'bg-amber-100 text-amber-700',
    published: 'bg-emerald-100 text-emerald-700',
};

export default function Posts({
    auth,
    articles = { data: [], links: [] },
    filters = {},
    sort = { field: 'id', direction: 'desc' },
    categories = [],
}) {
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingArticle, setEditingArticle] = useState(null);
    const [tableFilters, setTableFilters] = useState({
        q: filters.q || '',
        status: filters.status || '',
        created_by: filters.created_by || '',
        publication: filters.publication || '',
        category_ids: filters.category_ids || '',
        per_page: String(filters.per_page || 15),
    });

    const [createCoverPreview, setCreateCoverPreview] = useState(null);
    const [createThumbPreview, setCreateThumbPreview] = useState(null);
    const [editCoverPreview, setEditCoverPreview] = useState(null);
    const [editThumbPreview, setEditThumbPreview] = useState(null);
    const [createCategoryToAdd, setCreateCategoryToAdd] = useState('');
    const [editCategoryToAdd, setEditCategoryToAdd] = useState('');
    const [imageTime, setImageTime] = useState(Date.now());
    const searchDebounceRef = useRef(null);

    const createForm = useForm({
        title: '',
        slug: '',
        summary: '',
        content: '',
        category_ids: [],
        status: 'draft',
        published_at: '',
        cover: null,
        thumb: null,
    });

    const editForm = useForm({
        id: null,
        _method: 'put',
        title: '',
        slug: '',
        summary: '',
        content: '',
        category_ids: [],
        status: 'draft',
        published_at: '',
        cover: null,
        thumb: null,
    });

    const articleRows = useMemo(() => articles?.data || [], [articles]);
    const paginationLinks = useMemo(() => articles?.links || [], [articles]);

    const openEdit = (article) => {
        setEditingId(article.id);
        setEditingArticle(article);
        setEditCategoryToAdd('');
        setImageTime(Date.now());
        editForm.setData({
            id: article.id,
            _method: 'put',
            title: article.title || '',
            slug: article.slug || '',
            summary: article.summary || '',
            content: article.content || '',
            category_ids: Array.isArray(article.categories)
                ? article.categories.map((category) => String(category.id))
                : [],
            status: article.status || 'draft',
            published_at: article.published_at ? article.published_at.slice(0, 10) : '',
            cover: null,
            thumb: null,
        });
        setShowEdit(true);
    };

    const storageUrl = (path, time = null) => {
        if (!path) {
            return null;
        }
        return time ? `/storage/${path}?t=${time}` : `/storage/${path}`;
    };

    useEffect(() => {
        if (!createForm.data.cover) {
            setCreateCoverPreview(null);
            return;
        }
        const url = URL.createObjectURL(createForm.data.cover);
        setCreateCoverPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [createForm.data.cover]);

    useEffect(() => {
        if (!createForm.data.thumb) {
            setCreateThumbPreview(null);
            return;
        }
        const url = URL.createObjectURL(createForm.data.thumb);
        setCreateThumbPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [createForm.data.thumb]);

    useEffect(() => {
        if (!editForm.data.cover) {
            setEditCoverPreview(null);
            return;
        }
        const url = URL.createObjectURL(editForm.data.cover);
        setEditCoverPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [editForm.data.cover]);

    useEffect(() => {
        if (!editForm.data.thumb) {
            setEditThumbPreview(null);
            return;
        }
        const url = URL.createObjectURL(editForm.data.thumb);
        setEditThumbPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [editForm.data.thumb]);

    const handleDelete = (article) => {
        if (!confirm(`Eliminare l'articolo \"${article.title}\"?`)) {
            return;
        }
        editForm.delete(route('admin.posts.destroy', article.id), {
            preserveScroll: true,
        });
    };

    const applyFilters = (nextFilters = tableFilters, sortField = sort.field, sortDirection = sort.direction) => {
        router.get(
            route('admin.posts.index'),
            {
                ...nextFilters,
                sort: sortField,
                direction: sortDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const updateFilters = (partial, options = { debounce: false }) => {
        const next = {
            ...tableFilters,
            ...partial,
        };
        setTableFilters(next);

        if (options.debounce) {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
            searchDebounceRef.current = setTimeout(() => {
                applyFilters(next);
            }, 350);
            return;
        }

        applyFilters(next);
    };

    const resetFilters = () => {
        const reset = {
            q: '',
            status: '',
            created_by: '',
            publication: '',
            category_ids: '',
            per_page: '15',
        };
        setTableFilters(reset);
        applyFilters(reset, 'id', 'desc');
    };

    const toggleSort = (field) => {
        const nextDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
        applyFilters(tableFilters, field, nextDirection);
    };

    const sortLabel = (field) => {
        if (sort.field !== field) {
            return '';
        }
        return sort.direction === 'asc' ? ' ↑' : ' ↓';
    };

    const addCategoryToCreate = () => {
        if (!createCategoryToAdd) {
            return;
        }
        const current = Array.isArray(createForm.data.category_ids) ? createForm.data.category_ids : [];
        if (!current.includes(createCategoryToAdd)) {
            createForm.setData('category_ids', [...current, createCategoryToAdd]);
        }
    };

    const addCategoryToEdit = () => {
        if (!editCategoryToAdd) {
            return;
        }
        const current = Array.isArray(editForm.data.category_ids) ? editForm.data.category_ids : [];
        if (!current.includes(editCategoryToAdd)) {
            editForm.setData('category_ids', [...current, editCategoryToAdd]);
        }
    };

    const removeCategoryFromCreate = (categoryId) => {
        const current = Array.isArray(createForm.data.category_ids) ? createForm.data.category_ids : [];
        createForm.setData(
            'category_ids',
            current.filter((id) => id !== categoryId)
        );
    };

    const removeCategoryFromEdit = (categoryId) => {
        const current = Array.isArray(editForm.data.category_ids) ? editForm.data.category_ids : [];
        editForm.setData(
            'category_ids',
            current.filter((id) => id !== categoryId)
        );
    };

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Articoli</h2>}
        >
            <Head title="Articoli" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Gestione articoli</CardTitle>
                                <CardDescription>Lista articoli con stato editoriale.</CardDescription>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setCreateCategoryToAdd('');
                                    setShowCreate(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                <Plus className="h-4 w-4" />
                                Nuovo articolo
                            </button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                                <input
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Cerca (titolo, slug, id)"
                                    value={tableFilters.q}
                                    onChange={(e) =>
                                        updateFilters(
                                            { q: e.target.value },
                                            { debounce: true }
                                        )
                                    }
                                />
                                <select
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={tableFilters.status}
                                    onChange={(e) => updateFilters({ status: e.target.value })}
                                >
                                    <option value="">Stato: tutti</option>
                                    <option value="draft">Draft</option>
                                    <option value="review">Review</option>
                                    <option value="published">Published</option>
                                </select>
                                <select
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={tableFilters.created_by}
                                    onChange={(e) => updateFilters({ created_by: e.target.value })}
                                >
                                    <option value="">Creato da: tutti</option>
                                    <option value="admin">admin</option>
                                    <option value="ai">ai</option>
                                </select>
                                <select
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={tableFilters.publication}
                                    onChange={(e) => updateFilters({ publication: e.target.value })}
                                >
                                    <option value="">Pubblicazione: tutte</option>
                                    <option value="published">Pubblicati</option>
                                    <option value="unpublished">Non pubblicati</option>
                                </select>
                                <select
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={tableFilters.category_ids || ''}
                                    onChange={(e) => updateFilters({ category_ids: e.target.value })}
                                >
                                    <option value="">Categorie: tutte</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={tableFilters.per_page}
                                    onChange={(e) => updateFilters({ per_page: e.target.value })}
                                >
                                    <option value="10">10 / pagina</option>
                                    <option value="15">15 / pagina</option>
                                    <option value="25">25 / pagina</option>
                                    <option value="50">50 / pagina</option>
                                </select>
                                <div className="sm:col-span-2 lg:col-span-6 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="border-b border-slate-200 text-slate-500">
                                        <tr className="text-left">
                                            <th className="py-3 pr-4 font-medium">
                                                <button type="button" onClick={() => toggleSort('id')}>
                                                    ID{sortLabel('id')}
                                                </button>
                                            </th>
                                            <th className="py-3 pr-4 font-medium">
                                                <button type="button" onClick={() => toggleSort('title')}>
                                                    Titolo{sortLabel('title')}
                                                </button>
                                            </th>
                                            <th className="py-3 pr-4 font-medium">Categorie</th>
                                            <th className="py-3 pr-4 font-medium">
                                                <button type="button" onClick={() => toggleSort('status')}>
                                                    Stato{sortLabel('status')}
                                                </button>
                                            </th>
                                            <th className="py-3 pr-4 font-medium">
                                                <button type="button" onClick={() => toggleSort('published_at')}>
                                                    Pubblicazione{sortLabel('published_at')}
                                                </button>
                                            </th>
                                            <th className="py-3 pr-4 font-medium">
                                                <button type="button" onClick={() => toggleSort('created_at')}>
                                                    Creato il{sortLabel('created_at')}
                                                </button>
                                            </th>
                                            <th className="py-3 pr-4 font-medium text-right">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {articleRows.length === 0 && (
                                            <tr>
                                                <td className="py-6 text-slate-500" colSpan="7">
                                                    Nessun articolo presente.
                                                </td>
                                            </tr>
                                        )}
                                        {articleRows.map((article) => (
                                            <tr key={article.id} className="border-b border-slate-100">
                                                <td className="py-4 pr-4 text-slate-600">{article.id}</td>
                                                <td className="py-4 pr-4">
                                                    <div className="font-medium text-slate-900">{article.title}</div>
                                                    <div className="text-xs text-slate-500">{article.slug}</div>
                                                </td>
                                                <td className="py-4 pr-4 text-slate-600">
                                                    {Array.isArray(article.categories) && article.categories.length > 0
                                                        ? article.categories.map((category) => category.name).join(', ')
                                                        : '-'}
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                            statusStyles[article.status] || statusStyles.draft
                                                        }`}
                                                    >
                                                        {article.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4 text-slate-600">
                                                    {article.published_at
                                                        ? new Date(article.published_at).toLocaleDateString('it-IT')
                                                        : '-'}
                                                </td>
                                                <td className="py-4 pr-4 text-slate-600">
                                                    {article.created_at
                                                        ? new Date(article.created_at).toLocaleDateString('it-IT')
                                                        : '-'}
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(article)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                            aria-label="Modifica"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(article)}
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
                            {paginationLinks.length > 3 && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {paginationLinks.map((link, idx) => {
                                        const label = link.label
                                            .replace('&laquo;', '«')
                                            .replace('&raquo;', '»');
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
                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
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

            <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="2xl">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Nuovo articolo</h3>
                    <p className="mt-1 text-sm text-slate-500">Inserisci i dettagli principali.</p>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            createForm.post(route('admin.posts.store'), {
                                forceFormData: true,
                                preserveScroll: true,
                                onSuccess: () => {
                                    setShowCreate(false);
                                    createForm.reset();
                                    setCreateCategoryToAdd('');
                                },
                            });
                        }}
                        className="mt-6 space-y-4"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium text-slate-600">Titolo</label>
                                <input
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                />
                                <InputError message={createForm.errors.title} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Slug</label>
                                <input
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={createForm.data.slug}
                                    onChange={(e) => createForm.setData('slug', e.target.value)}
                                />
                                <InputError message={createForm.errors.slug} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Summary</label>
                            <textarea
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                rows="3"
                                value={createForm.data.summary}
                                onChange={(e) => createForm.setData('summary', e.target.value)}
                            />
                            <InputError message={createForm.errors.summary} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Contenuto</label>
                            <textarea
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                rows="6"
                                value={createForm.data.content}
                                onChange={(e) => createForm.setData('content', e.target.value)}
                            />
                            <InputError message={createForm.errors.content} className="mt-1" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="text-xs font-medium text-slate-600">Categorie</label>
                                <div className="mt-2 flex items-center gap-2">
                                    <select
                                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        value={createCategoryToAdd}
                                        onChange={(e) => setCreateCategoryToAdd(e.target.value)}
                                    >
                                        <option value="">Seleziona categoria</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addCategoryToCreate}
                                        className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                                    >
                                        Aggiungi
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(createForm.data.category_ids || []).map((categoryId) => {
                                        const category = categories.find((item) => String(item.id) === String(categoryId));
                                        return (
                                            <button
                                                type="button"
                                                key={`create-cat-${categoryId}`}
                                                onClick={() => removeCategoryFromCreate(categoryId)}
                                                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
                                            >
                                                {(category?.name || `ID ${categoryId}`)} ×
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={createForm.errors.category_ids} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Stato</label>
                                <select
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={createForm.data.status}
                                    onChange={(e) => createForm.setData('status', e.target.value)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="review">Review</option>
                                    <option value="published">Published</option>
                                </select>
                                <InputError message={createForm.errors.status} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Pubblicato il</label>
                                <input
                                    type="date"
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={createForm.data.published_at}
                                    onChange={(e) => createForm.setData('published_at', e.target.value)}
                                />
                                <InputError message={createForm.errors.published_at} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Cover
                                        </div>
                                        <div className="mt-1 text-slate-700">
                                            {createForm.data.cover?.name || 'Seleziona immagine'}
                                        </div>
                                    </div>
                                    <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300">
                                        Carica
                                    </span>
                                </div>
                                {createCoverPreview && (
                                    <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
                                        <img
                                            src={createCoverPreview}
                                            alt="Preview cover"
                                            className="h-32 w-full object-cover"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => createForm.setData('cover', e.target.files[0])}
                                />
                                <InputError message={createForm.errors.cover} className="mt-2" />
                            </label>
                            <label className="group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Thumb
                                        </div>
                                        <div className="mt-1 text-slate-700">
                                            {createForm.data.thumb?.name || 'Seleziona immagine'}
                                        </div>
                                    </div>
                                    <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300">
                                        Carica
                                    </span>
                                </div>
                                {createThumbPreview && (
                                    <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
                                        <img
                                            src={createThumbPreview}
                                            alt="Preview thumb"
                                            className="h-32 w-full object-cover"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => createForm.setData('thumb', e.target.files[0])}
                                />
                                <InputError message={createForm.errors.thumb} className="mt-2" />
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
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
                                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                Salva
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showEdit} onClose={() => setShowEdit(false)} maxWidth="2xl">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Modifica articolo</h3>
                    <p className="mt-1 text-sm text-slate-500">Aggiorna i dettagli principali.</p>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!editingId) {
                                return;
                            }
                            editForm.post(route('admin.posts.update', editingId), {
                                forceFormData: true,
                                preserveScroll: true,
                                onSuccess: () => {
                                    setShowEdit(false);
                                    setEditingId(null);
                                    setEditCategoryToAdd('');
                                },
                            });
                        }}
                        className="mt-6 space-y-4"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium text-slate-600">Titolo</label>
                                <input
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                />
                                <InputError message={editForm.errors.title} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Slug</label>
                                <input
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={editForm.data.slug}
                                    onChange={(e) => editForm.setData('slug', e.target.value)}
                                />
                                <InputError message={editForm.errors.slug} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Summary</label>
                            <textarea
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                rows="3"
                                value={editForm.data.summary}
                                onChange={(e) => editForm.setData('summary', e.target.value)}
                            />
                            <InputError message={editForm.errors.summary} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Contenuto</label>
                            <textarea
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                rows="6"
                                value={editForm.data.content}
                                onChange={(e) => editForm.setData('content', e.target.value)}
                            />
                            <InputError message={editForm.errors.content} className="mt-1" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="text-xs font-medium text-slate-600">Categorie</label>
                                <div className="mt-2 flex items-center gap-2">
                                    <select
                                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        value={editCategoryToAdd}
                                        onChange={(e) => setEditCategoryToAdd(e.target.value)}
                                    >
                                        <option value="">Seleziona categoria</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addCategoryToEdit}
                                        className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                                    >
                                        Aggiungi
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(editForm.data.category_ids || []).map((categoryId) => {
                                        const category = categories.find((item) => String(item.id) === String(categoryId));
                                        return (
                                            <button
                                                type="button"
                                                key={`edit-cat-${categoryId}`}
                                                onClick={() => removeCategoryFromEdit(categoryId)}
                                                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
                                            >
                                                {(category?.name || `ID ${categoryId}`)} ×
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={editForm.errors.category_ids} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Stato</label>
                                <select
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="review">Review</option>
                                    <option value="published">Published</option>
                                </select>
                                <InputError message={editForm.errors.status} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Pubblicato il</label>
                                <input
                                    type="date"
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    value={editForm.data.published_at}
                                    onChange={(e) => editForm.setData('published_at', e.target.value)}
                                />
                                <InputError message={editForm.errors.published_at} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Cover
                                        </div>
                                        <div className="mt-1 text-slate-700">
                                            {editForm.data.cover?.name || 'Seleziona immagine'}
                                        </div>
                                    </div>
                                    <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300">
                                        Carica
                                    </span>
                                </div>
                                {(editCoverPreview || storageUrl(editingArticle?.cover_path)) && (
                                    <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
                                        <img
                                            src={
                                                editCoverPreview || storageUrl(editingArticle?.cover_path, imageTime)
                                            }
                                            alt="Preview cover"
                                            className="h-32 w-full object-cover"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => editForm.setData('cover', e.target.files[0])}
                                />
                                <InputError message={editForm.errors.cover} className="mt-2" />
                            </label>
                            <label className="group cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Thumb
                                        </div>
                                        <div className="mt-1 text-slate-700">
                                            {editForm.data.thumb?.name || 'Seleziona immagine'}
                                        </div>
                                    </div>
                                    <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition group-hover:border-slate-300">
                                        Carica
                                    </span>
                                </div>
                                {(editThumbPreview || storageUrl(editingArticle?.thumb_path)) && (
                                    <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
                                        <img
                                            src={
                                                editThumbPreview || storageUrl(editingArticle?.thumb_path, imageTime)
                                            }
                                            alt="Preview thumb"
                                            className="h-32 w-full object-cover"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => editForm.setData('thumb', e.target.files[0])}
                                />
                                <InputError message={editForm.errors.thumb} className="mt-2" />
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
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
                                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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
