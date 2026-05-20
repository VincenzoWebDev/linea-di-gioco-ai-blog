import { lazy, Suspense } from "react";
import GlobalMapPlaceholder from "@/Components/blog/home/GlobalMapPlaceholder";

const GlobalMap = lazy(() => import("@/Components/blog/home/GlobalMap"));
const TacticalTicker = lazy(
    () => import("@/Components/blog/home/TacticalTicker"),
);

export default function HomeCommandCenter({ operations }) {
    const tickerItems = operations.length > 0 ? operations : [];

    return (
        <>
            <Suspense fallback={<GlobalMapPlaceholder />}>
                <GlobalMap operations={operations} />
            </Suspense>

            <Suspense fallback={null}>
                <TacticalTicker items={tickerItems} />
            </Suspense>
        </>
    );
}
