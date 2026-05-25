import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";

export default function QueueCard({ pendingByQueue = {} }) {
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
