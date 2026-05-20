export default function IntelligenceMetricBlock({ icon: Icon, label, value }) {
    return (
        <div className="border border-[#202A3D] bg-[#121722] p-3">
            <div className="flex items-center justify-between text-[#7E8796]">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    {label}
                </span>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="mt-3 font-mono text-2xl font-semibold text-[#E8EDF5]">
                {value}
            </div>
        </div>
    );
}
