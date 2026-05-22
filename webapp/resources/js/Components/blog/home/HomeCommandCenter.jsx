import { lazy, Suspense, useEffect, useState } from "react";
import GlobalMapPlaceholder from "@/Components/blog/home/GlobalMapPlaceholder";
import TacticalTicker from "@/Components/blog/home/TacticalTicker";

const GlobalMap = lazy(() => import("@/Components/blog/home/GlobalMap"));

export default function HomeCommandCenter({ operations }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const tickerItems = operations?.length > 0 ? operations : [];

    return (
        <>
            {/* Keep the first paint cheap, then load the interactive map chunk. */}
            {mounted ? (
                <Suspense fallback={<GlobalMapPlaceholder />}>
                    <GlobalMap operations={operations} />
                </Suspense>
            ) : (
                <GlobalMapPlaceholder />
            )}

            <TacticalTicker items={tickerItems} />
        </>
    );
}
