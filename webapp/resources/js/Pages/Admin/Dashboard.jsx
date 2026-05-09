import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";

function StatGrid({ stats = [] }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden">
                    <div
                        className={`h-1 w-full bg-gradient-to-r ${
                            stat.tone || "from-slate-300 to-slate-100"
                        }`}
                    />
                    <CardHeader>
                        <CardDescription>{stat.title}</CardDescription>
                        <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-600">
                            {stat.delta}
                        </span>
                        <span className="text-xs text-slate-500">{stat.note}</span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function SectionGrid({ sections = [] }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
                <Card
                    key={section.title}
                    className="transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <CardHeader>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-slate-700">{section.meta}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function QueueCard({ pendingByQueue = {} }) {
    const entries = Object.entries(pendingByQueue);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Code attive</CardTitle>
                <CardDescription>Job pendenti per coda Laravel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {entries.length === 0 ? (
                    <p className="text-sm text-slate-500">Nessun job in coda.</p>
                ) : (
                    entries.map(([queue, total]) => (
                        <div key={queue} className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">{queue}</span>
                            <span className="font-medium text-slate-900">{total}</span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function RecentIncomingCard({ items = [] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ultime notizie acquisite</CardTitle>
                <CardDescription>Stato reale degli ultimi item entrati</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-sm text-slate-500">Nessuna notizia recente.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                            <p className="text-sm font-medium text-slate-900">{item.title}</p>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                <span>{item.source || "Fonte sconosciuta"}</span>
                                <span>{item.status}</span>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function PipelineSummary({ pipeline = {}, content = {} }) {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Pipeline operativa</CardTitle>
                    <CardDescription>Stato attuale di acquisizione e validazione</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Raw</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {pipeline.status_breakdown?.raw ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Sanitized</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {pipeline.status_breakdown?.sanitized ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Validated</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {pipeline.status_breakdown?.validated ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Rejected</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {pipeline.status_breakdown?.rejected ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Queued jobs</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {pipeline.pending_jobs ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Extracted</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {pipeline.status_breakdown?.extracted ?? 0}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stato articoli</CardTitle>
                    <CardDescription>Situazione editoriale corrente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Bozze</span>
                        <span className="font-medium text-slate-900">{content.drafts ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">In revisione</span>
                        <span className="font-medium text-slate-900">{content.review ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Pubblicati</span>
                        <span className="font-medium text-slate-900">{content.published ?? 0}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function Dashboard({
    auth,
    stats = [],
    overview = {},
    pipeline = {},
    content = {},
    sections = [],
}) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-[1400px] space-y-8 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-10 text-white shadow-lg">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                            Overview
                        </p>
                        <h3 className="mt-2 text-3xl font-semibold">
                            {overview.headline || "Contenuti e pipeline sotto controllo."}
                        </h3>
                        <p className="mt-3 max-w-3xl text-sm text-slate-300">
                            {overview.subheadline ||
                                "Monitoraggio reale del sistema editoriale e della pipeline AI."}
                        </p>
                    </div>

                    <StatGrid stats={stats} />
                    <PipelineSummary pipeline={pipeline} content={content} />
                    <SectionGrid sections={sections} />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <QueueCard pendingByQueue={pipeline.pending_by_queue} />
                        <RecentIncomingCard items={pipeline.recent_incoming} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
