import { useEffect, useState } from "react";
import GlobalMap from "@/Components/blog/home/GlobalMap";
import GlobalMapPlaceholder from "@/Components/blog/home/GlobalMapPlaceholder";
import TacticalTicker from "@/Components/blog/home/TacticalTicker";

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
                <GlobalMap operations={operations} />
            ) : (
                <GlobalMapPlaceholder />
            )}

            <TacticalTicker items={tickerItems} />
        </>
    );
}
