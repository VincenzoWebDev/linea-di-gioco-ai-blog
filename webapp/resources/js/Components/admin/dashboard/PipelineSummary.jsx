import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";

export default function PipelineSummary({ pipeline = {}, content = {} }) {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Pipeline operativa</CardTitle>
                    <CardDescription>
                        Stato attuale di acquisizione e validazione
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        ["Raw", pipeline.status_breakdown?.raw ?? 0],
                        ["Sanitized", pipeline.status_breakdown?.sanitized ?? 0],
                        ["Validated", pipeline.status_breakdown?.validated ?? 0],
                        ["Rejected", pipeline.status_breakdown?.rejected ?? 0],
                        ["Queued jobs", pipeline.pending_jobs ?? 0],
                        ["Extracted", pipeline.status_breakdown?.extracted ?? 0],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stato articoli</CardTitle>
                    <CardDescription>Situazione editoriale corrente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        ["Bozze", content.drafts ?? 0],
                        ["In revisione", content.review ?? 0],
                        ["Pubblicati", content.published ?? 0],
                    ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-medium text-slate-900">{value}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
