import { useEffect } from "react";

export default function useConsentListener(onAnalyticsEnabled) {
    useEffect(() => {
        const handler = () => {
            const saved = JSON.parse(
                localStorage.getItem("cookie_consent") || "null"
            );

            if (saved?.analytics) {
                onAnalyticsEnabled?.();
            }
        };

        window.addEventListener("cookie-consent-updated", handler);

        return () =>
            window.removeEventListener("cookie-consent-updated", handler);
    }, [onAnalyticsEnabled]);
}