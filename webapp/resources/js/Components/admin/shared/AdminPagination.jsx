import { Link } from "@inertiajs/react";

export default function AdminPagination({ links = [] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-wrap items-center gap-2">
            {links.map((link, idx) => {
                const label = link.label
                    .replace("&laquo;", "«")
                    .replace("&raquo;", "»");

                if (!link.url) {
                    return (
                        <span
                            key={`${idx}-${label}`}
                            className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-400"
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={`${idx}-${label}`}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={`rounded-md border px-3 py-1 text-sm ${
                            link.active
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
