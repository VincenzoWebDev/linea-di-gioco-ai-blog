import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { B as BlogLayout } from "./BlogLayout-Do41-7kv.mjs";
import { useState, useEffect, Suspense, lazy, memo } from "react";
import { RadioTower, Activity, MapPin, ArrowRight, FileSearch, Target, Binary } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Link } from "@inertiajs/react";
import { a as ArticleIntelligenceCard } from "./ArticleIntelligenceCard-6E8fd8fc.mjs";
import { s as severityBadge, c as formatShortDate } from "./geopoliticalSeverity-B4PJR-9p.mjs";
import { t as trendCopy } from "./trendCopy-BRLsGmW-.mjs";
import { S as SeoHead } from "./SeoHead-9Gv-Y1Y7.mjs";
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
const GlobalMap = lazy(() => import("./GlobalMap-CSQL923n.mjs"));
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
    const loadMap = () => setShouldLoadMap(true);
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadMap, {
        timeout: 1200
      });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(loadMap, 450);
    return () => window.clearTimeout(timeoutId);
  }, [mounted]);
  const tickerItems = operations?.length > 0 ? operations : [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    mounted && shouldLoadMap ? /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(GlobalMapPlaceholder, {}), children: /* @__PURE__ */ jsx(GlobalMap, { operations }) }) : /* @__PURE__ */ jsx(GlobalMapPlaceholder, {}),
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
  return /* @__PURE__ */ jsxs("section", { className: "mt-10 sm:mt-14", children: [
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
  return /* @__PURE__ */ jsxs("section", { className: "mt-10 sm:mt-14", children: [
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
  return /* @__PURE__ */ jsx("section", { className: "mt-8 sm:mt-12 grid gap-4 md:grid-cols-3", children: items.map((item) => /* @__PURE__ */ jsxs(
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
  stats = {}
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
      /* @__PURE__ */ jsx(HomeLatestNewsSection, { items: latestItems })
    ] })
  ] });
}
export {
  Welcome as default
};
