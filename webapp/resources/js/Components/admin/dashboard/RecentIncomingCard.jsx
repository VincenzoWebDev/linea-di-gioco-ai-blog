import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";

export default function RecentIncomingCard({ items = [] }) {
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
