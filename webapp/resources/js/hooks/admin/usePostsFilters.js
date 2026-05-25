import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { DEFAULT_POST_FILTERS, filtersFromProps } from "@/lib/admin/posts";

export function usePostsFilters(initialFilters = {}, sort = { field: "id", direction: "desc" }) {
    const [tableFilters, setTableFilters] = useState(() => filtersFromProps(initialFilters));
    const searchDebounceRef = useRef(null);

    const applyFilters = (
        nextFilters = tableFilters,
        sortField = sort.field,
        sortDirection = sort.direction
    ) => {
        router.get(
            route("admin.posts.index"),
            {
                ...nextFilters,
                sort: sortField,
                direction: sortDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const updateFilters = (partial, options = { debounce: false }) => {
        const next = {
            ...tableFilters,
            ...partial,
        };
        setTableFilters(next);

        if (options.debounce) {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
            searchDebounceRef.current = setTimeout(() => {
                applyFilters(next);
            }, 350);
            return;
        }

        applyFilters(next);
    };

    const resetFilters = () => {
        const reset = { ...DEFAULT_POST_FILTERS };
        setTableFilters(reset);
        applyFilters(reset, "id", "desc");
    };

    const toggleSort = (field) => {
        const nextDirection =
            sort.field === field && sort.direction === "asc" ? "desc" : "asc";
        applyFilters(tableFilters, field, nextDirection);
    };

    const sortLabel = (field) => {
        if (sort.field !== field) {
            return "";
        }

        return sort.direction === "asc" ? " ↑" : " ↓";
    };

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, []);

    return {
        tableFilters,
        updateFilters,
        resetFilters,
        toggleSort,
        sortLabel,
    };
}
