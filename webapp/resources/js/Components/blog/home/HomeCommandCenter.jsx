import { lazy, Suspense, useEffect, useState } from "react";
import GlobalMapPlaceholder from "@/Components/blog/home/GlobalMapPlaceholder";
import TacticalTicker from "@/Components/blog/home/TacticalTicker";

const GlobalMap = lazy(() => import("@/Components/blog/home/GlobalMap"));

export default function HomeCommandCenter({ operations }) {
    const [mounted, setMounted] = useState(false);
    const [shouldLoadMap, setShouldLoadMap] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            return undefined;
        }

        const loadMap = () => setShouldLoadMap(true);

        if ("requestIdleCallback" in window) {
            const idleId = window.requestIdleCallback(loadMap, {
                timeout: 1200,
            });

            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = window.setTimeout(loadMap, 450);

        return () => window.clearTimeout(timeoutId);
    }, [mounted]);

    const tickerItems = operations?.length > 0 ? operations : [];

    return (
        <>
            {/* Keep the first paint cheap, then load the interactive map chunk. */}
            {mounted && shouldLoadMap ? (
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
