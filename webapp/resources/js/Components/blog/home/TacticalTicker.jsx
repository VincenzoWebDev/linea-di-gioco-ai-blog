import { useEffect, useState } from "react";
import { RadioTower } from "lucide-react";
import Marquee from "react-fast-marquee";

function formatCoordinate(value, axis) {
    const numeric = Number(value) || 0;
    const direction =
        axis === "lat" ? (numeric >= 0 ? "N" : "S") : numeric >= 0 ? "E" : "W";

    return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}

export default function TacticalTicker({ items }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="mt-6 overflow-hidden border-y border-[#202A3D] bg-[#0B0F15] py-3">
            {mounted ? (
                <Marquee gradient={false} speed={28} pauseOnHover>
                    {items.map((item) => (
                        <TickerItem key={`${item.id}-${item.title}`} item={item} />
                    ))}
                </Marquee>
            ) : (
                <div className="flex overflow-hidden">
                    {items.slice(0, 4).map((item) => (
                        <TickerItem key={`${item.id}-${item.title}`} item={item} />
                    ))}
                </div>
            )}
        </section>
    );
}

function TickerItem({ item }) {
    return (
        <div className="mx-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#9CA3AF]">
            <RadioTower className="h-4 w-4 text-[#D7B56D]" />
            <span className="text-[#D7B56D]">{item.operation_code}</span>
            <span>
                {formatCoordinate(item.lat, "lat")} /{" "}
                {formatCoordinate(item.long, "long")}
            </span>
            <span className="max-w-[420px] truncate text-[#E8EDF5]">
                {item.title}
            </span>
        </div>
    );
}
