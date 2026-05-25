import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";

export default function TensionsCard({ tensions = {} }) {
    const items = tensions.top || [];
    const latestUpdate = tensions.latest_update
        ? new Date(tensions.latest_update).toLocaleString("it-IT")
        : null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tensioni attive</CardTitle>
                <CardDescription>Situazione sotto l&apos;header del blog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-500">Totali</p>
                        <p className="text-lg font-semibold text-slate-900">
                            {tensions.total ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-500">Rischio alto</p>
                        <p className="text-lg font-semibold text-slate-900">
                            {tensions.high ?? 0}
                        </p>
                    </div>
                </div>
                {latestUpdate && (
                    <p className="text-xs text-slate-500">
                        Ultimo aggiornamento: {latestUpdate}
                    </p>
                )}
                {items.length === 0 ? (
                    <p className="text-sm text-slate-500">Nessuna tensione disponibile.</p>
                ) : (
                    items.map((item) => (
                        <div
                            key={`${item.region_name}-${item.updated_at}`}
                            className="rounded-lg border border-slate-200 p-3"
                        >
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-900">
                                    {item.region_name}
                                </span>
                                <span className="text-slate-600">{item.risk_score}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{item.status_label}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
