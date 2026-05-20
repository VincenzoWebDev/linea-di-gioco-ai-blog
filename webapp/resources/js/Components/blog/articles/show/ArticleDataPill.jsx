export default function ArticleDataPill({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0 border-t border-[#2A354D] px-4 py-3 first:border-t-0 sm:border-l sm:border-t-0 sm:py-2 sm:first:border-l-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#7E8796]">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <div className="mt-1 truncate font-mono text-sm text-[#E8EDF5]">
                {value}
            </div>
        </div>
    );
}
