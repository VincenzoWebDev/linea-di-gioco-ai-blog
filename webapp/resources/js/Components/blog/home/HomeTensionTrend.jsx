import { memo, useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

function HomeTensionTrend({ trend }) {
    if (!trend || !trend.points || trend.points.length === 0) {
        return null;
    }

    const { points, direction, current_average, delta } = trend;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const theme = {
        rising: {
            color: "#EF4444",
            bgGradient: "rgba(239, 68, 68, 0.05)",
            badge: "border-red-500/30 bg-red-950/20 text-red-400",
            dot: "bg-red-500 animate-pulse",
            desc: "L'indice registra un incremento della tensione geopolitica aggregata nell'ultima settimana, trainato dall'acutizzarsi dei focolai di crisi attivi.",
            icon: ArrowUpRight,
        },
        falling: {
            color: "#10B981",
            bgGradient: "rgba(16, 185, 129, 0.05)",
            badge: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
            dot: "bg-emerald-500",
            desc: "La pressione geopolitica globale evidenzia una parziale decompressione, riflettendo fasi di temporaneo consolidamento tattico o tregue negoziali.",
            icon: ArrowDownRight,
        },
        stable: {
            color: "#D7B56D",
            bgGradient: "rgba(215, 181, 109, 0.05)",
            badge: "border-[#D7B56D]/30 bg-amber-950/10 text-[#D7B56D]",
            dot: "bg-[#D7B56D]",
            desc: "L'equilibrio strategico del pianeta si attesta su una soglia di tesa stabilità, bilanciando spinte all'escalation e contenimenti difensivi.",
            icon: Activity,
        },
    }[direction] || {
        color: "#D7B56D",
        bgGradient: "rgba(215, 181, 109, 0.05)",
        badge: "border-[#D7B56D]/30 bg-amber-950/10 text-[#D7B56D]",
        dot: "bg-[#D7B56D]",
        desc: "L'equilibrio strategico del pianeta si attesta su una soglia di tesa stabilità.",
        icon: Activity,
    };

    const TrendIcon = theme.icon;

    // Generatore di path SVG statico per SEO/SSR Fallback
    const renderStaticSvg = () => {
        const width = 500;
        const height = 180;
        const padding = 20;
        
        const vals = points.map((p) => p.Tensione);
        const minVal = Math.min(...vals) - 3;
        const maxVal = Math.max(...vals) + 3;
        const range = maxVal - minVal || 1;

        const pointsCoords = points.map((p, index) => {
            const x = padding + (index * (width - padding * 2)) / (points.length - 1);
            const y = height - padding - ((p.Tensione - minVal) * (height - padding * 2)) / range;
            return { x, y };
        });

        // Crea il path string
        let d = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;
        for (let i = 1; i < pointsCoords.length; i++) {
            d += ` L ${pointsCoords[i].x} ${pointsCoords[i].y}`;
        }

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full opacity-60">
                <defs>
                    <linearGradient id="staticGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.color} stopOpacity="0.1" />
                        <stop offset="95%" stopColor={theme.color} stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#202A3D" strokeDasharray="3,3" strokeOpacity="0.3" />
                <path
                    d={`${d} L ${pointsCoords[pointsCoords.length - 1].x} ${height - padding} L ${pointsCoords[0].x} ${height - padding} Z`}
                    fill="url(#staticGrad)"
                />
                <path
                    d={d}
                    fill="none"
                    stroke={theme.color}
                    strokeWidth="1.5"
                />
                {pointsCoords.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={theme.color} />
                ))}
            </svg>
        );
    };

    return (
        <section className="mt-12 sm:mt-16 border-t border-[#202A3D]/50 pt-8 sm:pt-12">
            <div className="border border-[#202A3D] bg-[#101620] p-4 sm:p-6">
                <div className="grid gap-6 lg:grid-cols-12 items-center">
                    {/* Pannello Analitico Sinistro */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full min-w-0">
                        <div>
                            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#7E8796] flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5 text-[#D7B56D]" />
                                INDICE DI ALLERTA GEOPOLITICA
                            </span>
                            <h3 className="mt-2 font-serif text-lg sm:text-xl text-[#E8EDF5]">
                                Indice di Tensione Globale (ITG)
                            </h3>
                            
                            <div className="mt-4 flex items-baseline gap-2.5">
                                <span className="font-mono text-3xl sm:text-4xl font-bold text-[#E8EDF5]">
                                    {current_average.toFixed(1)}
                                </span>
                                <span className="font-mono text-[10px] text-[#7E8796]">/100 ITG</span>
                                {delta !== 0 && (
                                    <span className={`inline-flex items-center gap-0.5 font-mono text-xs ${delta > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                        <TrendIcon className="h-3.5 w-3.5 shrink-0" />
                                        {delta > 0 ? `+${delta}` : delta}
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${theme.badge}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                                    Trend: {direction === "rising" ? "In peggioramento" : direction === "falling" ? "In miglioramento" : "Stabile"}
                                </span>
                            </div>
                        </div>

                        <p className="mt-5 text-xs sm:text-[13px] leading-6 text-[#AAB3C2] border-t border-[#202A3D]/40 pt-4">
                            {theme.desc}
                        </p>
                    </div>

                    {/* Area Grafico Destra (Recharts Client-only / SVG Fallback SSR) */}
                    <div className="lg:col-span-7 h-44 sm:h-52 relative min-w-0">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={points} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.color} stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor={theme.color} stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{ fill: '#7E8796', fontSize: 10, fontFamily: 'monospace' }}
                                    />
                                    <YAxis 
                                        domain={['dataMin - 3', 'dataMax + 3']} 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{ fill: '#7E8796', fontSize: 10, fontFamily: 'monospace' }}
                                    />
                                    <Tooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="border border-[#202A3D] bg-[#0B0F15] p-2 font-mono text-[10px] text-[#E8EDF5]">
                                                        <p className="text-[#7E8796] mb-0.5">DATA: {payload[0].payload.date}</p>
                                                        <p className="font-semibold uppercase tracking-wider text-[#D7B56D]">
                                                            ITG: {payload[0].value} / 100
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="Tensione" 
                                        stroke={theme.color} 
                                        strokeWidth={1.5}
                                        fillOpacity={1} 
                                        fill="url(#colorTension)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            renderStaticSvg()
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default memo(HomeTensionTrend);