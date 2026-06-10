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

        if (typeof window === "undefined") {
            return undefined;
        }

        let isLoaded = false;
        let safetyTimeoutId = null;

        const loadMap = () => {
            if (isLoaded) return;
            isLoaded = true;

            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(() => setShouldLoadMap(true), {
                    timeout: 2000,
                });
            } else {
                setTimeout(() => setShouldLoadMap(true), 200);
            }

            cleanupListeners();
        };

        const cleanupListeners = () => {
            if (safetyTimeoutId) {
                clearTimeout(safetyTimeoutId);
            }
            window.removeEventListener("touchstart", loadMap, { passive: true });
            window.removeEventListener("mousemove", loadMap, { passive: true });
            window.removeEventListener("scroll", loadMap, { passive: true });
            window.removeEventListener("pointerdown", loadMap, { passive: true });
        };

        window.addEventListener("touchstart", loadMap, { passive: true });
        window.addEventListener("mousemove", loadMap, { passive: true });
        window.addEventListener("scroll", loadMap, { passive: true });
        window.addEventListener("pointerdown", loadMap, { passive: true });

        // Safety net: load map anyway after 5 seconds of inactivity
        safetyTimeoutId = setTimeout(loadMap, 5000);

        return cleanupListeners;
    }, [mounted]);

    const tickerItems = operations?.length > 0 ? operations : [];

    return (
        <>
            {/* Keep the first paint cheap, then load the interactive map chunk. */}
            <div id="command-center-map-container" className="min-w-0">
                {mounted && shouldLoadMap ? (
                    <Suspense fallback={<GlobalMapPlaceholder />}>
                        <GlobalMap operations={operations} />
                    </Suspense>
                ) : (
                    <GlobalMapPlaceholder />
                )}
            </div>

            <TacticalTicker items={tickerItems} />
        </>
    );
}
