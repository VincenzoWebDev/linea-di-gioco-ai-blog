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

        if (!("IntersectionObserver" in window)) {
            setShouldLoadMap(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    const loadMap = () => setShouldLoadMap(true);

                    if ("requestIdleCallback" in window) {
                        const idleId = window.requestIdleCallback(loadMap, {
                            timeout: 2000,
                        });
                        observer.disconnect();
                        return () => window.cancelIdleCallback(idleId);
                    } else {
                        const timeoutId = window.setTimeout(loadMap, 1000);
                        observer.disconnect();
                        return () => window.clearTimeout(timeoutId);
                    }
                }
            },
            {
                rootMargin: "150px",
            }
        );

        const element = document.getElementById("command-center-map-container");
        if (element) {
            observer.observe(element);
        }

        return () => observer.disconnect();
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
