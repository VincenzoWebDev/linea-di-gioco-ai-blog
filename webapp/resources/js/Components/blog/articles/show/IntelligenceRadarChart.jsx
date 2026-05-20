import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from "recharts";

export default function IntelligenceRadarChart({ metrics }) {
    return (
        <div className="h-64 border border-[#182234] bg-[#0E1116] px-1 py-2 sm:h-80 sm:px-2 sm:py-3">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                    data={metrics}
                    outerRadius="58%"
                    margin={{ top: 12, right: 20, bottom: 12, left: 20 }}
                >
                    <PolarGrid stroke="#2A354D" radialLines />
                    <PolarAngleAxis
                        dataKey="axis"
                        tick={{
                            fill: "#AAB3C2",
                            fontSize: 10,
                            fontFamily: "monospace",
                        }}
                    />
                    <Radar
                        dataKey="value"
                        stroke="#D7B56D"
                        fill="#D7B56D"
                        fillOpacity={0.22}
                        strokeWidth={2}
                        animationDuration={900}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
