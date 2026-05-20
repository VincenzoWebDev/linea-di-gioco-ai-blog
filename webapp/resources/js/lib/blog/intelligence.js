import { findCoordinates } from "@/lib/blog/regionCoordinates";
import {
    alertFromRiskScore,
    resolveSeverityThresholds,
} from "@/lib/geopoliticalSeverity";

export function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, Math.round(Number(value) || 0)));
}

export function buildIntelligence(article, riskThresholds = {}) {
    const hasTension = article.tension?.risk_score != null;
    const riskScore = clamp(hasTension ? article.tension.risk_score : 38);
    const qualityScore = clamp(article.quality_score ?? 55);
    const trendBump =
        article.tension?.trend_direction === "rising"
            ? 5
            : article.tension?.trend_direction === "falling"
              ? -4
              : 0;

    const metrics = [
        { axis: "Militare", value: clamp(riskScore + trendBump + 2) },
        { axis: "Economico", value: clamp(riskScore * 0.88 + 4) },
        { axis: "Diplomatico", value: clamp(riskScore * 0.78 + trendBump) },
        {
            axis: "Energia",
            value: clamp(riskScore * 0.72 + (article.topic ? 6 : 0)),
        },
        {
            axis: "Informativo",
            value: clamp(qualityScore * 0.75 + riskScore * 0.2),
        },
    ];

    const averageImpact = clamp(
        metrics.reduce((sum, item) => sum + item.value, 0) / metrics.length,
    );

    const scenarioHigh = riskThresholds.scenarioHigh ?? 78;
    const severityThresholds = resolveSeverityThresholds(riskThresholds);
    const alert = alertFromRiskScore(riskScore, severityThresholds);

    return {
        alertLevel: alert.label,
        alertClasses: alert.className,
        severityKey: alert.key,
        averageImpact,
        coordinates: findCoordinates(article),
        metrics,
        riskScore,
        qualityScore,
        scenario:
            riskScore >= scenarioHigh
                ? "Probabile intensificazione della pressione diplomatica e aumento della sorveglianza nelle prossime finestre operative."
                : "Scenario in consolidamento: monitorare segnali politici, catene logistiche e variazioni nella postura militare regionale.",
        hasTension,
    };
}
