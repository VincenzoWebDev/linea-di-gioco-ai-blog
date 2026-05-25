import { useEffect, useRef } from "react";
import { router } from "@inertiajs/react";

export function useTensionsSearch(initialQuery = "") {
    const debounceRef = useRef(null);

    const applySearch = (q) => {
        router.get(
            route("admin.tensions.index"),
            { q },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const onSearchChange = (value) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            applySearch(value);
        }, 350);
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        initialQuery,
        onSearchChange,
    };
}
