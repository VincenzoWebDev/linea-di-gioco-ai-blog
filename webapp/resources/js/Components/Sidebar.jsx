import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    FileText,
    Newspaper,
    Tags,
    Globe2,
    Settings,
    Image as ImageIcon,
    Users,
} from "lucide-react";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const page = usePage();
    const currentPath = normalizePath(page.url);
    const items = [
        {
            label: "Dashboard",
            href: route("admin.dashboard"),
            Icon: LayoutDashboard,
            isActive: (path) =>
                path === "/admin/dashboard" || path === "/admin",
        },
        {
            label: "Articoli",
            href: route("admin.posts.index"),
            Icon: Newspaper,
            isActive: (path) => path.startsWith("/admin/posts"),
        },
        {
            label: "Categorie",
            href: route("admin.categories.index"),
            Icon: Tags,
            isActive: (path) => path.startsWith("/admin/categories"),
        },
        {
            label: "Tensioni",
            href: route("admin.tensions.index"),
            Icon: Globe2,
            isActive: (path) => path.startsWith("/admin/tensions"),
        },
        
        {
            label: "Pagine",
            href: route("admin.pages.index"),
            Icon: FileText,
            isActive: (path) => path.startsWith("/admin/pages"),
        },
        {
            label: "Impostazioni",
            href: route("admin.settings.index"),
            Icon: Settings,
            isActive: (path) => path.startsWith("/admin/settings"),
        },
        {
            label: "Media",
            href: route("admin.media.index"),
            Icon: ImageIcon,
            isActive: (path) => path.startsWith("/admin/media"),
        },
        {
            label: "Utenti",
            href: route("admin.users.index"),
            Icon: Users,
            isActive: (path) => path.startsWith("/admin/users"),
        },
    ];

    return (
        <aside
            className={`hidden md:flex md:flex-col bg-white border-r border-gray-200 transition-all duration-200 ${
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
                    const isActive = item.isActive(currentPath);
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

function normalizePath(url) {
    if (typeof url !== "string" || url.trim() === "") {
        return "/";
    }

    const [path] = url.split("?");
    const normalized = path.startsWith("/") ? path : `/${path}`;

    return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}
