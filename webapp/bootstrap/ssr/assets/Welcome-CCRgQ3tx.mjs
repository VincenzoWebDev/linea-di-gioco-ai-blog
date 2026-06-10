import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { B as BlogLayout } from "./BlogLayout-98RL58NA.mjs";
import { memo, useState, useEffect, Suspense, lazy } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Minus, TrendingUp, TrendingDown, RadioTower, MapPin, ArrowRight, FileSearch, Target, Binary } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Link } from "@inertiajs/react";
import { a as ArticleIntelligenceCard } from "./ArticleIntelligenceCard-6E8fd8fc.mjs";
import { s as severityBadge } from "./geopoliticalSeverity-BBhZMy0g.mjs";
import { t as trendCopy } from "./trendCopy-BRLsGmW-.mjs";
import { c as formatShortDate } from "./formatters-BAb3XZ2i.mjs";
import { S as SeoHead } from "./SeoHead-9Gv-Y1Y7.mjs";
const HomeTensionTrendChart = lazy(() => import("./HomeTensionTrendChart-jpd_e7C4.mjs"));
function HomeTensionTrend({ trend }) {
  if (!trend || !trend.points || trend.points.length === 0) {
    return null;
  }
  const { points, direction, current_average, delta } = trend;
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const theme = {
    rising: {
      color: "#EF4444",
      bgGradient: "rgba(239, 68, 68, 0.05)",
      badge: "border-red-500/30 bg-red-950/20 text-red-400",
      dot: "bg-red-500 animate-pulse",
      desc: "L'indice registra un incremento della tensione geopolitica aggregata nell'ultima settimana, trainato dall'acutizzarsi dei focolai di crisi attivi.",
      icon: ArrowUpRight
    },
    falling: {
      color: "#10B981",
      bgGradient: "rgba(16, 185, 129, 0.05)",
      badge: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
      dot: "bg-emerald-500",
      desc: "La pressione geopolitica globale evidenzia una parziale decompressione, riflettendo fasi di temporaneo consolidamento tattico o tregue negoziali.",
      icon: ArrowDownRight
    },
    stable: {
      color: "#D7B56D",
      bgGradient: "rgba(215, 181, 109, 0.05)",
      badge: "border-[#D7B56D]/30 bg-amber-950/10 text-[#D7B56D]",
      dot: "bg-[#D7B56D]",
      desc: "L'equilibrio strategico del pianeta si attesta su una soglia di tesa stabilità, bilanciando spinte all'escalation e contenimenti difensivi.",
      icon: Activity
    }
  }[direction] || {
    color: "#D7B56D",
    bgGradient: "rgba(215, 181, 109, 0.05)",
    badge: "border-[#D7B56D]/30 bg-amber-950/10 text-[#D7B56D]",
    dot: "bg-[#D7B56D]",
    desc: "L'equilibrio strategico del pianeta si attesta su una soglia di tesa stabilità.",
    icon: Activity
  };
  const TrendIcon = theme.icon;
  const renderStaticSvg = () => {
    const width = 500;
    const height = 180;
    const padding = 20;
    const vals = points.map((p) => p.Tensione);
    const minVal = Math.min(...vals) - 3;
    const maxVal = Math.max(...vals) + 3;
    const range = maxVal - minVal || 1;
    const pointsCoords = points.map((p, index) => {
      const x = padding + index * (width - padding * 2) / (points.length - 1);
      const y = height - padding - (p.Tensione - minVal) * (height - padding * 2) / range;
      return { x, y };
    });
    let d = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;
    for (let i = 1; i < pointsCoords.length; i++) {
      d += ` L ${pointsCoords[i].x} ${pointsCoords[i].y}`;
    }
    return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${width} ${height}`, className: "w-full h-full opacity-60", children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "staticGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: theme.color, stopOpacity: "0.1" }),
        /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: theme.color, stopOpacity: "0.0" })
      ] }) }),
      /* @__PURE__ */ jsx("line", { x1: "0", y1: height * 0.25, x2: width, y2: height * 0.25, stroke: "#384968", strokeDasharray: "3,3", strokeOpacity: "0.35" }),
      /* @__PURE__ */ jsx("line", { x1: "0", y1: height * 0.5, x2: width, y2: height * 0.5, stroke: "#384968", strokeDasharray: "3,3", strokeOpacity: "0.35" }),
      /* @__PURE__ */ jsx("line", { x1: "0", y1: height * 0.75, x2: width, y2: height * 0.75, stroke: "#384968", strokeDasharray: "3,3", strokeOpacity: "0.35" }),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: `${d} L ${pointsCoords[pointsCoords.length - 1].x} ${height - padding} L ${pointsCoords[0].x} ${height - padding} Z`,
          fill: "url(#staticGrad)"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d,
          fill: "none",
          stroke: theme.color,
          strokeWidth: "1.5"
        }
      ),
      pointsCoords.map((pt, i) => /* @__PURE__ */ jsx("circle", { cx: pt.x, cy: pt.y, r: "3", fill: theme.color }, i))
    ] });
  };
  return /* @__PURE__ */ jsx("section", { className: "mt-12 sm:mt-16 border-t border-[#202A3D]/50 pt-12 sm:pt-16", children: /* @__PURE__ */ jsxs("div", { className: "border border-[#202A3D] bg-[#101620] p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-12 items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 flex flex-col justify-between h-full min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#7E8796] flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5 text-[#D7B56D]" }),
            "INDICE DI ALLERTA GEOPOLITICA"
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-2 font-serif text-lg sm:text-xl text-[#E8EDF5]", children: "Indice di Tensione Globale (ITG)" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-baseline gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-3xl sm:text-4xl font-bold text-[#E8EDF5]", children: current_average.toFixed(1) }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-[#7E8796]", children: "/100 ITG" }),
            delta !== 0 && /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-0.5 font-mono text-xs ${delta > 0 ? "text-red-400" : "text-emerald-400"}`, children: [
              /* @__PURE__ */ jsx(TrendIcon, { className: "h-3.5 w-3.5 shrink-0" }),
              delta > 0 ? `+${delta}` : delta
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${theme.badge}`, children: [
            /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${theme.dot}` }),
            "Trend: ",
            direction === "rising" ? "In peggioramento" : direction === "falling" ? "In miglioramento" : "Stabile"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-xs sm:text-[13px] leading-6 text-[#AAB3C2] border-b border-[#202A3D]/40 pb-4 lg:border-b-0 lg:pb-0", children: theme.desc })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-7 h-44 sm:h-52 relative min-w-0", children: isMounted ? /* @__PURE__ */ jsx(Suspense, { fallback: renderStaticSvg(), children: /* @__PURE__ */ jsx(HomeTensionTrendChart, { points, theme }) }) : renderStaticSvg() })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 border-t border-[#202A3D]/50 pt-6", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#7E8796] block", children: "STRESS TEST REGIONALI & TRAIETTORIE" }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5", children: (trend.macro_regions || []).map((reg) => {
        const getRegionStyles = (score, dir) => {
          let scoreColor = "text-[#D7B56D]";
          if (score >= 75) scoreColor = "text-red-500";
          else if (score >= 50) scoreColor = "text-orange-500";
          let trendBadge = "border-[#202A3D]/60 bg-[#0E1116] text-[#7E8796]";
          let TrendIcon2 = Minus;
          let trendLabel = "Stabile";
          if (dir === "rising") {
            trendBadge = "border-red-500/20 bg-red-950/15 text-red-400";
            TrendIcon2 = TrendingUp;
            trendLabel = "Crescente";
          } else if (dir === "falling") {
            trendBadge = "border-emerald-500/20 bg-emerald-950/15 text-emerald-400";
            TrendIcon2 = TrendingDown;
            trendLabel = "In calo";
          }
          return { scoreColor, trendBadge, TrendIcon: TrendIcon2, trendLabel };
        };
        const styles = getRegionStyles(reg.score, reg.direction);
        const RegionIcon = styles.TrendIcon;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "border border-[#202A3D]/40 bg-[#0B0F15]/30 p-4 flex flex-col justify-between transition-colors hover:border-[#202A3D] group",
            children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-sans text-xs font-semibold text-[#AAB3C2] uppercase tracking-wider truncate group-hover:text-[#E8EDF5] transition-colors", children: reg.name }),
                /* @__PURE__ */ jsxs("span", { className: `font-mono text-3xl font-bold block mt-2 ${styles.scoreColor}`, children: [
                  reg.score,
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#7E8796] font-normal ml-1", children: "ITG" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-4 pt-3 border-t border-[#202A3D]/30", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 border font-mono text-[9px] uppercase tracking-wider ${styles.trendBadge}`, children: [
                /* @__PURE__ */ jsx(RegionIcon, { className: "h-3 w-3 shrink-0" }),
                styles.trendLabel
              ] }) })
            ]
          },
          reg.name
        );
      }) })
    ] })
  ] }) });
}
const HomeTensionTrend$1 = memo(HomeTensionTrend);
function GlobalMapPlaceholder() {
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" }),
    /* @__PURE__ */ jsxs("div", { className: "relative grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:p-7", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]", children: "Scenario globale" }),
            /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-6xl", children: "Centro di comando" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-12 w-40 animate-pulse border border-[#2A354D] bg-[#101620]/90" })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "mt-5 sm:mt-7 aspect-[1.55] sm:aspect-[1.72] w-full max-w-full animate-pulse border border-[#182234] bg-[#0B0F15]/80",
            "aria-hidden": true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "min-w-0 border border-[#202A3D] bg-[#101620]/95 p-4 sm:p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "h-6 w-32 animate-pulse bg-[#182234]" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 h-8 w-48 animate-pulse bg-[#182234]" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-16 animate-pulse border border-[#202A3D] bg-[#0B0F15]" }),
          /* @__PURE__ */ jsx("div", { className: "h-16 animate-pulse border border-[#202A3D] bg-[#0B0F15]" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 h-40 animate-pulse border border-[#202A3D] bg-[#0B0F15]" })
      ] })
    ] })
  ] });
}
function formatCoordinate(value, axis) {
  const numeric = Number(value) || 0;
  const direction = axis === "lat" ? numeric >= 0 ? "N" : "S" : numeric >= 0 ? "E" : "W";
  return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}
function TacticalTicker({ items }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (items.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx("section", { className: "mt-6 overflow-hidden border-y border-[#202A3D] bg-[#0B0F15] py-3", children: mounted ? /* @__PURE__ */ jsx(Marquee, { gradient: false, speed: 28, pauseOnHover: true, children: items.map((item) => /* @__PURE__ */ jsx(TickerItem, { item }, `${item.id}-${item.title}`)) }) : /* @__PURE__ */ jsx("div", { className: "flex overflow-hidden", children: items.slice(0, 4).map((item) => /* @__PURE__ */ jsx(TickerItem, { item }, `${item.id}-${item.title}`)) }) });
}
function TickerItem({ item }) {
  return /* @__PURE__ */ jsxs("div", { className: "mx-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#9CA3AF]", children: [
    /* @__PURE__ */ jsx(RadioTower, { className: "h-4 w-4 text-[#D7B56D]" }),
    /* @__PURE__ */ jsx("span", { className: "text-[#D7B56D]", children: item.operation_code }),
    /* @__PURE__ */ jsxs("span", { children: [
      formatCoordinate(item.lat, "lat"),
      " /",
      " ",
      formatCoordinate(item.long, "long")
    ] }),
    /* @__PURE__ */ jsx("span", { className: "max-w-[420px] truncate text-[#E8EDF5]", children: item.title })
  ] });
}
const GlobalMap = lazy(() => import("./GlobalMap-jYMm572D.mjs"));
function HomeCommandCenter({ operations }) {
  const [mounted, setMounted] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) {
      return void 0;
    }
    if (typeof window === "undefined") {
      return void 0;
    }
    if (!("IntersectionObserver" in window)) {
      setShouldLoadMap(true);
      return void 0;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const loadMap = () => setShouldLoadMap(true);
          if ("requestIdleCallback" in window) {
            const idleId = window.requestIdleCallback(loadMap, {
              timeout: 2e3
            });
            observer.disconnect();
            return () => window.cancelIdleCallback(idleId);
          } else {
            const timeoutId = window.setTimeout(loadMap, 1e3);
            observer.disconnect();
            return () => window.clearTimeout(timeoutId);
          }
        }
      },
      {
        rootMargin: "150px"
      }
    );
    const element = document.getElementById("command-center-map-container");
    if (element) {
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, [mounted]);
  const tickerItems = operations?.length > 0 ? operations : [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { id: "command-center-map-container", className: "min-w-0", children: mounted && shouldLoadMap ? /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(GlobalMapPlaceholder, {}), children: /* @__PURE__ */ jsx(GlobalMap, { operations }) }) : /* @__PURE__ */ jsx(GlobalMapPlaceholder, {}) }),
    /* @__PURE__ */ jsx(TacticalTicker, { items: tickerItems })
  ] });
}
function OperationIntelligenceCard({ item, index }) {
  const TrendIcon = trendCopy[item.trend_direction]?.icon || Activity;
  return /* @__PURE__ */ jsx(
    ArticleIntelligenceCard,
    {
      article: {
        id: item.article?.id ?? item.id,
        slug: item.article?.slug ?? String(item.id),
        title: item.title,
        summary: item.summary,
        cover_url: item.cover_url,
        thumb_url: item.thumb_url,
        operation_code: item.operation_code
      },
      index,
      href: item.url || route("blog.articles.index"),
      ctaLabel: "Analizza dossier",
      statusBadge: severityBadge(item.severity),
      imageLoading: index === 0 ? "eager" : "lazy",
      imageFetchPriority: index === 0 ? "high" : "auto",
      chips: [
        { icon: MapPin, value: item.display_region_name || item.region_name || "Hotspot" },
        {
          icon: TrendIcon,
          value: trendCopy[item.trend_direction]?.label || "Stabile"
        }
      ]
    }
  );
}
const OperationIntelligenceCard$1 = memo(OperationIntelligenceCard);
function EmptyState$1() {
  return /* @__PURE__ */ jsx("div", { className: "border border-dashed border-[#2A354D] bg-[#101620] p-8 text-[#9CA3AF]", children: "La sala operativa resta pronta per le prime analisi pubblicate." });
}
function HomeFeedSection({ items }) {
  return /* @__PURE__ */ jsxs("section", { className: "mt-12 sm:mt-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]", children: "Flusso analisi" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl", children: "File declassificati" })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("blog.articles.index"),
          className: "inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]",
          children: [
            "Archivio completo",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ]
        }
      )
    ] }),
    items.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3", children: items.slice(0, 6).map((item, index) => /* @__PURE__ */ jsx(
      OperationIntelligenceCard$1,
      {
        item,
        index
      },
      `${item.id}-${item.operation_code}`
    )) }) : /* @__PURE__ */ jsx(EmptyState$1, {})
  ] });
}
function EmptyState() {
  return /* @__PURE__ */ jsx("div", { className: "border border-dashed border-[#2A354D] bg-[#101620] p-8 text-[#9CA3AF]", children: "Nessuna notizia recente disponibile." });
}
function HomeLatestNewsSection({ items = [] }) {
  return /* @__PURE__ */ jsxs("section", { className: "mt-12 sm:mt-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]", children: "Ultime notizie" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl", children: "Ultimi aggiornamenti dal blog" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-3xl text-sm leading-7 text-[#AAB3C2] sm:text-base", children: "Una sequenza editoriale lineare delle pubblicazioni più recenti, utile per lettori e motori di ricerca." })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("blog.articles.index"),
          className: "inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]",
          children: [
            "Tutte le notizie",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ]
        }
      )
    ] }),
    items.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3", children: items.slice(0, 3).map((item, index) => /* @__PURE__ */ jsx(
      OperationIntelligenceCard$1,
      {
        item,
        index
      },
      `${item.id}-${item.operation_code}`
    )) }) : /* @__PURE__ */ jsx(EmptyState, {})
  ] });
}
function HomeStatsSection({ stats, hotspotsCount }) {
  const items = [
    { label: "Dossier", value: stats.articlesCount || 0, icon: FileSearch },
    {
      label: "Hotspot",
      value: stats.hotspotsCount ?? hotspotsCount,
      icon: Target
    },
    {
      label: "Agg.",
      value: formatShortDate(stats.latestPublishedAt),
      icon: Binary
    }
  ];
  return /* @__PURE__ */ jsx("section", { className: "mt-10 sm:mt-14 grid gap-4 md:grid-cols-3", children: items.map((item) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "border border-[#202A3D] bg-[#101620] p-5",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.24em] text-[#7E8796]", children: item.label }),
          /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5 text-[#D7B56D]" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 font-mono text-2xl font-semibold text-[#E8EDF5]", children: item.value })
      ]
    },
    item.label
  )) });
}
const HOME_DESCRIPTION = "Analisi geopolitiche, dossier internazionali e report strategici su crisi, sicurezza, energia e hotspot globali monitorati in tempo reale.";
function buildHomeSeo(canonicalUrl) {
  const organizationName = "Linea di gioco";
  return {
    title: "Analisi geopolitiche e dossier internazionali",
    description: HOME_DESCRIPTION,
    canonicalUrl,
    keywords: [
      "geopolitica",
      "analisi geopolitica",
      "dossier internazionali",
      "crisi internazionali",
      "intelligence open source"
    ],
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: organizationName,
        url: canonicalUrl,
        inLanguage: "it-IT",
        description: HOME_DESCRIPTION
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organizationName,
        url: canonicalUrl,
        logo: {
          "@type": "ImageObject",
          "url": `${canonicalUrl.replace(/\/$/, "")}/images/logo-schema.png`
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Analisi geopolitiche e dossier internazionali",
        url: canonicalUrl,
        inLanguage: "it-IT",
        description: HOME_DESCRIPTION,
        isPartOf: {
          "@type": "WebSite",
          name: organizationName,
          url: canonicalUrl
        }
      }
    ]
  };
}
function resolveLcpImageUrl(item) {
  if (!item) {
    return null;
  }
  return item.thumb_url || item.article?.thumb_url || item.cover_url || item.article?.cover_url || null;
}
function Welcome({
  feedItems = [],
  latestItems = [],
  locations = [],
  stats = {},
  globalTrend = {}
}) {
  const lcpImageUrl = resolveLcpImageUrl(feedItems[0]);
  const canonicalUrl = route("home");
  const seo = buildHomeSeo(canonicalUrl);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        ...seo,
        preloadImages: lcpImageUrl ? [{ href: lcpImageUrl, fetchPriority: "high" }] : []
      }
    ),
    /* @__PURE__ */ jsxs(BlogLayout, { children: [
      /* @__PURE__ */ jsx(HomeCommandCenter, { operations: locations }),
      /* @__PURE__ */ jsx(
        HomeStatsSection,
        {
          stats,
          hotspotsCount: locations.length
        }
      ),
      /* @__PURE__ */ jsx(HomeFeedSection, { items: feedItems }),
      /* @__PURE__ */ jsx(HomeLatestNewsSection, { items: latestItems }),
      /* @__PURE__ */ jsx(HomeTensionTrend$1, { trend: globalTrend })
    ] })
  ] });
}
export {
  Welcome as default
};
