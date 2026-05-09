import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Users({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Utenti</h2>}
        >
            <Head title="Utenti" />

            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestione utenti</CardTitle>
                            <CardDescription>Qui aggiungeremo ruoli, permessi e inviti.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-slate-600">Layout di base pronto.</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
