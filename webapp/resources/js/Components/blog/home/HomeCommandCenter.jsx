import { lazy, Suspense, useEffect, useState } from "react";
import GlobalMapPlaceholder from "@/Components/blog/home/GlobalMapPlaceholder";

const TacticalTicker = lazy(
    () => import("@/Components/blog/home/TacticalTicker"),
);

export default function HomeCommandCenter({ operations }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const tickerItems = operations?.length > 0 ? operations : [];

    return (
        <>
            {/* GLOBAL MAP: render SOLO client-side (fix hydration crash) */}
            {mounted ? (
                <Suspense fallback={<GlobalMapPlaceholder />}>
                    <LazyGlobalMap operations={operations} />
                </Suspense>
            ) : (
                <GlobalMapPlaceholder />
            )}

            {/* ticker ok in lazy (meno rischioso) */}
            <Suspense fallback={null}>
                <TacticalTicker items={tickerItems} />
            </Suspense>
        </>
    );
}

// lazy definito fuori per evitare re-import dinamici
const LazyGlobalMap = lazy(() => import("@/Components/blog/home/GlobalMap"));
