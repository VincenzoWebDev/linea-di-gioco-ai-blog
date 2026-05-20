import { Activity, TrendingDown, TrendingUp } from "lucide-react";
const IT_MONTHS_SHORT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic"
];
function parseDate(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function pad(value) {
  return String(value).padStart(2, "0");
}
function formatShortDate(value) {
  const date = parseDate(value);
  if (!date) {
    return "In arrivo";
  }
  return `${pad(date.getUTCDate())} ${IT_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
function formatPublishedAt(value) {
  const date = parseDate(value);
  if (!date) {
    return "Data n.d.";
  }
  return `${pad(date.getUTCDate())} ${IT_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) {
    return "Non disponibile";
  }
  return `${pad(date.getUTCDate())} ${IT_MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(
    date.getUTCMinutes()
  )} UTC`;
}
const trendCopy = {
  rising: { label: "Escalation", icon: TrendingUp },
  falling: { label: "Decompressione", icon: TrendingDown },
  stable: { label: "Stabile", icon: Activity }
};
function getTrendConfig(direction) {
  if (direction === "rising") {
    return {
      icon: TrendingUp,
      label: "In crescita",
      color: "text-[#EF4444]",
      bg: "bg-[#EF4444]/10"
    };
  }
  if (direction === "falling") {
    return {
      icon: TrendingDown,
      label: "In calo",
      color: "text-[#38BDF8]",
      bg: "bg-[#38BDF8]/10"
    };
  }
  return {
    icon: Activity,
    label: "Stabile",
    color: "text-[#D7B56D]",
    bg: "bg-[#D7B56D]/10"
  };
}
const severityClasses = {
  high: {
    label: "Rosso",
    marker: "#EF4444",
    border: "border-[#EF4444]/50",
    text: "text-[#FCA5A5]",
    bg: "bg-[#EF4444]/10",
    fill: "#EF4444"
  },
  elevated: {
    label: "Arancione",
    marker: "#F97316",
    border: "border-[#F97316]/50",
    text: "text-[#FDBA74]",
    bg: "bg-[#F97316]/10",
    fill: "#F97316"
  },
  guarded: {
    label: "Giallo",
    marker: "#D7B56D",
    border: "border-[#D7B56D]/50",
    text: "text-[#FDE68A]",
    bg: "bg-[#D7B56D]/10",
    fill: "#D7B56D"
  },
  low: {
    label: "Verde",
    marker: "#22C55E",
    border: "border-[#22C55E]/50",
    text: "text-[#86EFAC]",
    bg: "bg-[#22C55E]/10",
    fill: "#22C55E"
  }
};
const alertLabels = {
  high: "Rossa",
  elevated: "Arancione",
  guarded: "Gialla",
  low: "Verde"
};
const DEFAULT_SEVERITY_THRESHOLDS = {
  high: 80,
  elevated: 60,
  guarded: 40
};
function severityFromRiskScore(score, thresholds = DEFAULT_SEVERITY_THRESHOLDS) {
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
function severityBadge(severityKey) {
  const severity = severityClasses[severityKey] || severityClasses.low;
  return {
    label: severity.label,
    border: severity.border,
    bg: severity.bg,
    text: severity.text
  };
}
function severityAlertClassName(severityKey) {
  const badge = severityBadge(severityKey);
  return `${badge.border} ${badge.bg} ${badge.text}`;
}
function alertFromRiskScore(score, thresholds = DEFAULT_SEVERITY_THRESHOLDS) {
  const key = severityFromRiskScore(score, thresholds);
  return {
    key,
    label: alertLabels[key],
    className: severityAlertClassName(key),
    badge: severityBadge(key)
  };
}
function resolveSeverityThresholds(riskThresholds = {}) {
  return {
    high: riskThresholds.severityHigh ?? riskThresholds.alertHigh ?? DEFAULT_SEVERITY_THRESHOLDS.high,
    elevated: riskThresholds.severityElevated ?? riskThresholds.alertElevated ?? DEFAULT_SEVERITY_THRESHOLDS.elevated,
    guarded: riskThresholds.severityGuarded ?? riskThresholds.alertGuarded ?? DEFAULT_SEVERITY_THRESHOLDS.guarded
  };
}
export {
  alertFromRiskScore as a,
  formatPublishedAt as b,
  formatShortDate as c,
  severityClasses as d,
  formatDateTime as f,
  getTrendConfig as g,
  resolveSeverityThresholds as r,
  severityBadge as s,
  trendCopy as t
};
