import { useEffect } from "react";
import { hasAnalyticsConsent } from "@/utils/consent";
import { loadGA } from "@/services/analytics";

export default function useAnalytics() {
    useEffect(() => {
        if (hasAnalyticsConsent()) {
            loadGA();
        }
    }, []);
}