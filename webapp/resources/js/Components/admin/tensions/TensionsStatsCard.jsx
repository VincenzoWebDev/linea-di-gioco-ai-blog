import { Card } from "@/Components/ui/card";

export default function TensionsStatsCard({ stats = {} }) {
    return (
        <Card className="p-6">
            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <p className="text-xs text-slate-500">Totali</p>
                    <p className="text-xl font-semibold text-slate-900">{stats.total ?? 0}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Rischio alto (≥70)</p>
                    <p className="text-xl font-semibold text-slate-900">{stats.high ?? 0}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Rischio medio</p>
                    <p className="text-xl font-semibold text-slate-900">{stats.avg ?? 0}</p>
                </div>
            </div>
        </Card>
    );
}
