export function getConsent() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return JSON.parse(localStorage.getItem("cookie_consent") || "null");
    } catch {
        return null;
    }
}

export function hasAnalyticsConsent() {
    const consent = getConsent();
    return consent?.analytics === true;
}