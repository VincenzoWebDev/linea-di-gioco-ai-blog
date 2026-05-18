export function getConsent() {
    const raw = document.cookie
        .split('; ')
        .find(row => row.startsWith('cookie_consent='));

    if (!raw) return null;

    try {
        return JSON.parse(decodeURIComponent(raw.split('=')[1]));
    } catch {
        return null;
    }
}

export function hasAnalyticsConsent() {
    const consent = getConsent();
    return consent?.analytics === true;
}