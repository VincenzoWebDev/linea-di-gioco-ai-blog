export const severityClasses = {
    high: {
        label: "Rosso",
        marker: "#EF4444",
        border: "border-[#EF4444]/50",
        text: "text-[#FCA5A5]",
        bg: "bg-[#EF4444]/10",
        fill: "#EF4444",
    },
    elevated: {
        label: "Arancione",
        marker: "#F97316",
        border: "border-[#F97316]/50",
        text: "text-[#FDBA74]",
        bg: "bg-[#F97316]/10",
        fill: "#F97316",
    },
    guarded: {
        label: "Giallo",
        marker: "#D7B56D",
        border: "border-[#D7B56D]/50",
        text: "text-[#FDE68A]",
        bg: "bg-[#D7B56D]/10",
        fill: "#D7B56D",
    },
    low: {
        label: "Verde",
        marker: "#22C55E",
        border: "border-[#22C55E]/50",
        text: "text-[#86EFAC]",
        bg: "bg-[#22C55E]/10",
        fill: "#22C55E",
    },
};

/** Etichette femminili per "Allerta Rossa", ecc. */
export const alertLabels = {
    high: "Rossa",
    elevated: "Arancione",
    guarded: "Gialla",
    low: "Verde",
};

export const DEFAULT_SEVERITY_THRESHOLDS = {
    high: 80,
    elevated: 60,
    guarded: 40,
};

export function severityFromRiskScore(
    score,
    thresholds = DEFAULT_SEVERITY_THRESHOLDS,
) {
    const value = Number(score) || 0;

    if (value >= thresholds.high) {
        return "high";
    }
    if (value >= thresholds.elevated) {
        return "elevated";
    }
    if (value >= thresholds.guarded) {
        return "guarded";
    }

    return "low";
}

export function severityBadge(severityKey) {
    const severity = severityClasses[severityKey] || severityClasses.low;

    return {
        label: severity.label,
        border: severity.border,
        bg: severity.bg,
        text: severity.text,
    };
}

export function severityAlertClassName(severityKey) {
    const badge = severityBadge(severityKey);

    return `${badge.border} ${badge.bg} ${badge.text}`;
}

/**
 * Allerta articolo: stesse soglie e palette dei badge home/archivio.
 */
export function alertFromRiskScore(
    score,
    thresholds = DEFAULT_SEVERITY_THRESHOLDS,
) {
    const key = severityFromRiskScore(score, thresholds);

    return {
        key,
        label: alertLabels[key],
        className: severityAlertClassName(key),
        badge: severityBadge(key),
    };
}

export function resolveSeverityThresholds(riskThresholds = {}) {
    return {
        high:
            riskThresholds.severityHigh ??
            riskThresholds.alertHigh ??
            DEFAULT_SEVERITY_THRESHOLDS.high,
        elevated:
            riskThresholds.severityElevated ??
            riskThresholds.alertElevated ??
            DEFAULT_SEVERITY_THRESHOLDS.elevated,
        guarded:
            riskThresholds.severityGuarded ??
            riskThresholds.alertGuarded ??
            DEFAULT_SEVERITY_THRESHOLDS.guarded,
    };
}
