import { RadioTower } from "lucide-react";
import Marquee from "react-fast-marquee";

function formatCoordinate(value, axis) {
    const numeric = Number(value) || 0;
    const direction =
        axis === "lat" ? (numeric >= 0 ? "N" : "S") : numeric >= 0 ? "E" : "W";

    return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}

export default function TacticalTicker({ items }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section className="mt-6 overflow-hidden border-y border-[#202A3D] bg-[#0B0F15] py-3">
            <Marquee gradient={false} speed={28} pauseOnHover>
                {items.map((item) => (
                    <div
                        key={`${item.id}-${item.title}`}
                        className="mx-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#9CA3AF]"
                    >
                        <RadioTower className="h-4 w-4 text-[#D7B56D]" />
                        <span className="text-[#D7B56D]">
                            {item.operation_code}
                        </span>
                        <span>
                            {formatCoordinate(item.lat, "lat")} /{" "}
                            {formatCoordinate(item.long, "long")}
                        </span>
                        <span className="max-w-[420px] truncate text-[#E8EDF5]">
                            {item.title}
                        </span>
                    </div>
                ))}
            </Marquee>
        </section>
    );
}
