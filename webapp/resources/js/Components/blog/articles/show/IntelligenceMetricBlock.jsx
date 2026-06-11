export default function IntelligenceMetricBlock({ icon: Icon, label, value, isExpired }) {
    return (
        <div className={`border border-[#202A3D] bg-[#121722] p-3 ${isExpired ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between text-[#7E8796]">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    {label}
                </span>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className={`mt-3 font-mono text-2xl font-semibold ${isExpired ? "line-through text-slate-500" : "text-[#E8EDF5]"}`}>
                {value}
            </div>
            {isExpired && (
                <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-red-500 font-bold leading-none">
                    Scaduta
                </div>
            )}
        </div>
    );
}
