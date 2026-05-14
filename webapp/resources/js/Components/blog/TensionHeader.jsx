import { Link } from "@inertiajs/react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

const trendIcon = {
    rising: TrendingUp,
    falling: TrendingDown,
    stable: Minus,
};

function riskColor(score) {
    if (score >= 75) {
        return "text-red-600";
    }
    if (score >= 50) {
        return "text-orange-600";
    }
    if (score >= 25) {
        return "text-yellow-600";
    }

    return "text-green-600";
}

function TensionItem({ tension }) {
    const Trend = trendIcon[tension.trend_direction] ?? Minus;
    const content = (
        <>
            <span className="max-w-32 truncate text-[#E5E7EB]">
                {tension.region_name}
            </span>
            <Trend className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
            <span className={riskColor(tension.risk_score)}>
                {tension.risk_score}
            </span>
        </>
    );

    const className =
        "flex h-8 shrink-0 items-center gap-2 rounded-md border border-[#1C2333] bg-[#0E1116] px-3";

    if (tension.article_url) {
        return (
            <Link
                href={tension.article_url}
                title={tension.status_label}
                className={`${className} transition hover:border-[#2C4667]`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div title={tension.status_label} className={className}>
            {content}
        </div>
    );
}

export default function TensionHeader({ tensions = [] }) {
    const visibleTensions = tensions.slice(0, 5);

    if (visibleTensions.length === 0) {
        return null;
    }

    return (
        <div
            className="border-t border-[#1C2333] bg-[#111722]/95"
            aria-label="Top tensioni geopolitiche"
        >
            <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-6 py-3 text-xs">
                <span className="shrink-0 uppercase tracking-[0.22em] text-[#6B7280]">
                    Tensioni
                </span>
                <div className="flex min-w-0 gap-2">
                    {visibleTensions.map((tension) => (
                        <TensionItem
                            key={tension.region_name}
                            tension={tension}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
