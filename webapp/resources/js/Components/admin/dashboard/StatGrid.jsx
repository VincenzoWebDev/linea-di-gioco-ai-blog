import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";

export default function StatGrid({ stats = [] }) {
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
