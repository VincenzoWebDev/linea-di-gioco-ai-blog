import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function HomeTensionTrendChart({ points, theme }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={theme.color} stopOpacity={0.0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#384968" opacity={0.4} vertical={false} />
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
    );
}
