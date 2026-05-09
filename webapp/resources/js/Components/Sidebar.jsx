import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    LayoutDashboard,
    FileText,
    Newspaper,
    Tags,
    Settings,
    Image as ImageIcon,
    Users,
} from "lucide-react";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const items = useMemo(
        () => [
            {
                label: "Dashboard",
                href: route("admin.dashboard"),
                Icon: LayoutDashboard,
            },
            { label: "Pagine", href: "/admin/pages", Icon: FileText },
            { label: "Articoli", href: "/admin/posts", Icon: Newspaper },
            { label: "Categorie", href: "/admin/categories", Icon: Tags },
            { label: "Impostazioni", href: "/admin/settings", Icon: Settings },
            { label: "Media", href: "/admin/media", Icon: ImageIcon },
            { label: "Utenti", href: "/admin/users", Icon: Users },
        ],
        [],
    );

    return (
        <aside
            className={`hidden md:flex md:flex-col bg-white border-r border-gray-200 transition-all duration-200 h-screen ${
                isCollapsed ? "w-16" : "w-64"
            }`}
        >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
                {!isCollapsed && (
                    <div className="text-sm font-semibold text-gray-700">
                        Admin
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsCollapsed((previous) => !previous)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                    aria-label="Toggle sidebar"
                >
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 5h14v2H3V5zm0 4h10v2H3V9zm0 4h14v2H3v-2z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {items.map((item) => {
                    const isActive =
                        item.label === "Dashboard" &&
                        route().current("admin.dashboard");
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                                isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                                <item.Icon className="h-4 w-4" />
                            </span>
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
