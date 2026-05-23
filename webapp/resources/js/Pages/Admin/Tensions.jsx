import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const trendLabel = {
    rising: 'In crescita',
    falling: 'In calo',
    stable: 'Stabile',
};

export default function Tensions({ auth, tensions = { data: [], links: [] }, filters = {}, articles = [], stats = {} }) {
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const createForm = useForm({
        region_name: '',
        risk_score: 50,
        trend_direction: 'stable',
        status_label: '',
        featured_article_id: '',
        latitude: '',
        longitude: '',
    });

    const editForm = useForm({
        _method: 'put',
        region_name: '',
        risk_score: 50,
        trend_direction: 'stable',
        status_label: '',
        featured_article_id: '',
        latitude: '',
        longitude: '',
    });

    const rows = useMemo(() => tensions?.data || [], [tensions]);

    const openEdit = (item) => {
        setEditingId(item.id);
        editForm.setData({
            _method: 'put',
            region_name: item.region_name || '',
            risk_score: item.risk_score || 50,
            trend_direction: item.trend_direction || 'stable',
            status_label: item.status_label || '',
            featured_article_id: item.featured_article_id ? String(item.featured_article_id) : '',
            latitude: item.latitude ?? '',
            longitude: item.longitude ?? '',
        });
        setShowEdit(true);
    };

    const applySearch = (q) => {
        router.get(route('admin.tensions.index'), { q }, { preserveState: true, replace: true });
    };

    const handleDelete = (item) => {
        if (!confirm(`Eliminare la tensione "${item.region_name}"?`)) return;
        router.delete(route('admin.tensions.destroy', item.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Tensioni</h2>}>
            <Head title="Tensioni" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardContent className="grid gap-3 p-6 sm:grid-cols-3">
                            <div><p className="text-xs text-slate-500">Totali</p><p className="text-xl font-semibold">{stats.total ?? 0}</p></div>
                            <div><p className="text-xs text-slate-500">Rischio alto (>=70)</p><p className="text-xl font-semibold">{stats.high ?? 0}</p></div>
                            <div><p className="text-xs text-slate-500">Rischio medio</p><p className="text-xl font-semibold">{stats.avg ?? 0}</p></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Gestione tensioni</CardTitle>
                                <CardDescription>CRUD completo per la barra tensioni del blog.</CardDescription>
                            </div>
                            <button type="button" onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                                <Plus className="h-4 w-4" /> Nuova tensione
                            </button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <input
                                    defaultValue={filters.q || ''}
                                    placeholder="Cerca regione/stato/articolo"
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    onChange={(e) => applySearch(e.target.value)}
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="border-b border-slate-200 text-slate-500">
                                        <tr className="text-left">
                                            <th className="py-3 pr-4">Regione</th>
                                            <th className="py-3 pr-4">Risk</th>
                                            <th className="py-3 pr-4">Trend</th>
                                            <th className="py-3 pr-4">Stato</th>
                                            <th className="py-3 pr-4">Articolo</th>
                                            <th className="py-3 pr-4 text-right">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 && (
                                            <tr><td colSpan="6" className="py-6 text-slate-500">Nessuna tensione.</td></tr>
                                        )}
                                        {rows.map((item) => (
                                            <tr key={item.id} className="border-b border-slate-100">
                                                <td className="py-3 pr-4 font-medium">{item.region_name}</td>
                                                <td className="py-3 pr-4">{item.risk_score}</td>
                                                <td className="py-3 pr-4">{trendLabel[item.trend_direction] || 'Stabile'}</td>
                                                <td className="py-3 pr-4">{item.status_label}</td>
                                                <td className="py-3 pr-4">{item.featured_article?.title || '-'}</td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button type="button" onClick={() => openEdit(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button>
                                                        <button type="button" onClick={() => handleDelete(item)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {(tensions?.links || []).length > 3 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {tensions.links.map((link, idx) => (
                                        link.url ? (
                                            <Link key={`${idx}-${link.label}`} href={link.url} preserveState preserveScroll className={`rounded-md border px-3 py-1 text-sm ${link.active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span key={`${idx}-${link.label}`} className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="2xl">
                <div className="p-6">
                    <h3 className="text-lg font-semibold">Nuova tensione</h3>
                    <TensionForm form={createForm} articles={articles} onSubmit={() => createForm.post(route('admin.tensions.store'), { onSuccess: () => setShowCreate(false) })} />
                </div>
            </Modal>

            <Modal show={showEdit} onClose={() => setShowEdit(false)} maxWidth="2xl">
                <div className="p-6">
                    <h3 className="text-lg font-semibold">Modifica tensione</h3>
                    <TensionForm form={editForm} articles={articles} onSubmit={() => editForm.post(route('admin.tensions.update', editingId), { onSuccess: () => setShowEdit(false) })} />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

function TensionForm({ form, articles, onSubmit }) {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Regione" error={form.errors.region_name}><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.data.region_name} onChange={(e) => form.setData('region_name', e.target.value)} /></Field>
                <Field label="Risk score" error={form.errors.risk_score}><input type="number" min="1" max="100" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.data.risk_score} onChange={(e) => form.setData('risk_score', e.target.value)} /></Field>
                <Field label="Trend" error={form.errors.trend_direction}><select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.data.trend_direction} onChange={(e) => form.setData('trend_direction', e.target.value)}><option value="stable">Stabile</option><option value="rising">In crescita</option><option value="falling">In calo</option></select></Field>
                <Field label="Etichetta stato" error={form.errors.status_label}><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.data.status_label} onChange={(e) => form.setData('status_label', e.target.value)} /></Field>
                <Field label="Articolo collegato" error={form.errors.featured_article_id}><select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.data.featured_article_id} onChange={(e) => form.setData('featured_article_id', e.target.value)}><option value="">Nessuno</option>{articles.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}</select></Field>
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Lat" error={form.errors.latitude}><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.data.latitude} onChange={(e) => form.setData('latitude', e.target.value)} /></Field>
                    <Field label="Long" error={form.errors.longitude}><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.data.longitude} onChange={(e) => form.setData('longitude', e.target.value)} /></Field>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">Salva</button>
            </div>
        </form>
    );
}

function Field({ label, children, error }) {
    return (
        <div>
            <label className="text-xs font-medium text-slate-600">{label}</label>
            {children}
            <InputError message={error} className="mt-1" />
        </div>
    );
}
