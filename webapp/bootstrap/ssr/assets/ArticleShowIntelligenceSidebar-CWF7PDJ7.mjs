import { jsxs, jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Crosshair, Target, Shield } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { g as getTrendConfig } from "./trendCopy-BRLsGmW-.mjs";
function IntelligenceMetricBlock({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "border border-[#202A3D] bg-[#121722] p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[#7E8796]", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] uppercase tracking-[0.2em]", children: label }),
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 font-mono text-2xl font-semibold text-[#E8EDF5]", children: value })
  ] });
}
function IntelligenceRadarChart({ metrics }) {
  return /* @__PURE__ */ jsx("div", { className: "h-64 border border-[#182234] bg-[#0E1116] px-1 py-2 sm:h-80 sm:px-2 sm:py-3", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
    RadarChart,
    {
      data: metrics,
      outerRadius: "58%",
      margin: { top: 12, right: 20, bottom: 12, left: 20 },
      children: [
        /* @__PURE__ */ jsx(PolarGrid, { stroke: "#2A354D", radialLines: true }),
        /* @__PURE__ */ jsx(
          PolarAngleAxis,
          {
            dataKey: "axis",
            tick: {
              fill: "#AAB3C2",
              fontSize: 10,
              fontFamily: "monospace"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          Radar,
          {
            dataKey: "value",
            stroke: "#D7B56D",
            fill: "#D7B56D",
            fillOpacity: 0.22,
            strokeWidth: 2,
            animationDuration: 900
          }
        )
      ]
    }
  ) }) });
}
function IntelligenceRadarIcon() {
  return /* @__PURE__ */ jsxs("div", { className: "relative h-6 w-6 rounded-full border border-[#D7B56D]", children: [
    /* @__PURE__ */ jsx(
      motion.span,
      {
        className: "absolute left-1/2 top-1/2 h-px w-3 origin-left bg-[#D7B56D]",
        animate: { rotate: 360 },
        transition: { duration: 2.2, repeat: Infinity, ease: "linear" }
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D7B56D]" })
  ] });
}
function ArticleShowIntelligenceSidebar({
  article,
  intelligence
}) {
  const trend = getTrendConfig(article.tension?.trend_direction);
  const TrendIcon = trend.icon;
  return /* @__PURE__ */ jsx("aside", { className: "min-w-0 max-w-full lg:sticky lg:top-8 lg:self-start", children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.45 },
      className: "border border-[#202A3D] bg-[#0B0F15]/90 p-4 shadow-2xl shadow-black/20 sm:p-5",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.28em] text-[#7E8796]", children: "Matrice operativa" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-semibold text-[#F3F4F6]", children: "Impatto operativo" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10", children: /* @__PURE__ */ jsx(IntelligenceRadarIcon, {}) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsx(IntelligenceRadarChart, { metrics: intelligence.metrics }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsx(
            IntelligenceMetricBlock,
            {
              label: "Tensione",
              value: article.tension?.current_tension ?? intelligence.riskScore,
              icon: Crosshair
            }
          ),
          /* @__PURE__ */ jsx(
            IntelligenceMetricBlock,
            {
              label: "Impatto",
              value: intelligence.averageImpact,
              icon: Target
            }
          ),
          /* @__PURE__ */ jsx(
            IntelligenceMetricBlock,
            {
              label: "Fonte",
              value: intelligence.qualityScore,
              icon: Shield
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border border-[#202A3D] bg-[#121722] px-4 py-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.22em] text-[#7E8796]", children: "Tendenza" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-[#D7DEE8]", children: trend.label })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `flex h-10 w-10 items-center justify-center rounded-full ${trend.bg} ${trend.color}`,
                children: /* @__PURE__ */ jsx(TrendIcon, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border border-[#202A3D] bg-[#121722] px-4 py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.22em] text-[#7E8796]", children: "Scenari futuri" }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 grid gap-3", children: (article.future_scenarios?.length > 0 ? article.future_scenarios : [intelligence.scenario]).map((line, index) => /* @__PURE__ */ jsx(
              "p",
              {
                className: "font-mono text-sm leading-7 text-[#C8D0DC]",
                children: line
              },
              `${index}-${line}`
            )) })
          ] })
        ] })
      ]
    }
  ) });
}
export {
  ArticleShowIntelligenceSidebar as default
};
