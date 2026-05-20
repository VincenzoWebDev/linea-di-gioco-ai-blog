import { Binary, FileSearch, Target } from "lucide-react";
import { formatShortDate } from "@/lib/blog/formatters";

export default function HomeStatsSection({ stats, hotspotsCount }) {
    const items = [
        { label: "Dossier", value: stats.articlesCount || 0, icon: FileSearch },
        {
            label: "Hotspot",
            value: stats.hotspotsCount ?? hotspotsCount,
            icon: Target,
        },
        {
            label: "Agg.",
            value: formatShortDate(stats.latestPublishedAt),
            icon: Binary,
        },
    ];

    return (
        <section className="mt-8 sm:mt-12 grid gap-4 md:grid-cols-3">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="border border-[#202A3D] bg-[#101620] p-5"
                >
                    <div className="flex items-center justify-between gap-4">
                        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#7E8796]">
                            {item.label}
                        </p>
                        <item.icon className="h-5 w-5 text-[#D7B56D]" />
                    </div>
                    <div className="mt-4 font-mono text-2xl font-semibold text-[#E8EDF5]">
                        {item.value}
                    </div>
                </div>
            ))}
        </section>
    );
}
