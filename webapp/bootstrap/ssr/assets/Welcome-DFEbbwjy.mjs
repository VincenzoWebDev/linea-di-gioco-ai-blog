import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { FileSearch, Target, Binary, ArrowRight, Radar, ShieldAlert, Satellite, Crosshair, MapPin, RadioTower, Activity, TrendingDown, TrendingUp } from "lucide-react";
import Marquee from "react-fast-marquee";
import { ComposableMap, Graticule, Geographies, Geography, Marker } from "react-simple-maps";
import { useMemo, useState } from "react";
import { B as BlogLayout } from "./BlogLayout-DZ2SoYAz.mjs";
import { A as ArticleCoverImage, b as severityClasses, a as ArticleIntelligenceCard, s as severityBadge } from "./geopoliticalSeverity-C_GoMzyn.mjs";
import { S as SeoHead } from "./SeoHead-Bfgu-MHE.mjs";
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const trendCopy = {
  rising: { label: "Escalation", icon: TrendingUp },
  falling: { label: "Decompressione", icon: TrendingDown },
  stable: { label: "Stabile", icon: Activity }
};
function formatDate(value) {
  if (!value) {
    return "In arrivo";
  }
  return new Date(value).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function formatCoordinate(value, axis) {
  const numeric = Number(value) || 0;
  const direction = axis === "lat" ? numeric >= 0 ? "N" : "S" : numeric >= 0 ? "E" : "W";
  return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}
function normalizeOperations(locations, articles) {
  if (locations.length > 0) {
    return locations.map((location) => ({
      ...location,
      title: location.article?.title || location.region_name,
      summary: location.article?.summary || location.status_label,
      url: location.article?.url || null,
      published_at: location.article?.published_at || location.updated_at,
      thumb_url: location.article?.thumb_url || location.article?.cover_url || null,
      cover_url: location.article?.cover_url || location.article?.thumb_url || null
    }));
  }
  return articles.map((article, index) => ({
    ...article,
    title: article.title,
    summary: article.excerpt || article.summary,
    url: route("blog.articles.show", { id: article.id, slug: article.slug }),
    region_name: article.topic || "Dossier globale",
    risk_score: 38,
    severity: index === 0 ? "elevated" : "guarded",
    trend_direction: "stable",
    operation_code: article.operation_code || `OP-${String(article.id).padStart(4, "0")}`,
    article,
    thumb_url: article.thumb_url || article.cover_url || null,
    cover_url: article.cover_url || article.thumb_url || null
  }));
}
function GlobalMap({ operations }) {
  const [activeId, setActiveId] = useState(operations[0]?.id || null);
  const active = operations.find((item) => item.id === activeId) || operations[0];
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" }),
    /* @__PURE__ */ jsxs("div", { className: "relative grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:p-7", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]", children: "Scenario globale" }),
            /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-6xl", children: "Centro di comando" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]", children: [
            /* @__PURE__ */ jsx(Satellite, { className: "h-4 w-4 text-[#D7B56D]" }),
            "Monitoraggio AI attivo"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 sm:mt-7 aspect-[1.55] sm:aspect-[1.72] w-full max-w-full overflow-hidden border border-[#182234] bg-[#0B0F15]/80 [&_svg]:max-w-full [&_svg]:origin-center [&_svg]:scale-[1.02] sm:[&_svg]:scale-[1.1]", children: /* @__PURE__ */ jsxs(
          ComposableMap,
          {
            projectionConfig: { rotate: [-10, 0, 0], scale: 178 },
            className: "h-full w-full",
            children: [
              /* @__PURE__ */ jsx(Graticule, { stroke: "#233047", strokeWidth: 0.35 }),
              /* @__PURE__ */ jsx(Geographies, { geography: geoUrl, children: ({ geographies }) => geographies.map((geo) => /* @__PURE__ */ jsx(
                Geography,
                {
                  geography: geo,
                  fill: "#111827",
                  stroke: "#263248",
                  strokeWidth: 0.42,
                  style: {
                    default: { outline: "none" },
                    hover: { fill: "#162238", outline: "none" },
                    pressed: { outline: "none" }
                  }
                },
                geo.rsmKey
              )) }),
              operations.map((item) => {
                const severity = severityClasses[item.severity] || severityClasses.guarded;
                return /* @__PURE__ */ jsx(
                  Marker,
                  {
                    coordinates: [Number(item.long), Number(item.lat)],
                    onMouseEnter: () => setActiveId(item.id),
                    onFocus: () => setActiveId(item.id),
                    children: /* @__PURE__ */ jsxs(
                      motion.g,
                      {
                        animate: { scale: [1, 1.28, 1] },
                        transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                        className: "cursor-pointer",
                        children: [
                          /* @__PURE__ */ jsx("circle", { r: 12, fill: severity.marker, fillOpacity: 0.16 }),
                          /* @__PURE__ */ jsx("circle", { r: 5.5, fill: severity.marker, fillOpacity: 0.34 }),
                          /* @__PURE__ */ jsx("circle", { r: 2.6, fill: severity.marker })
                        ]
                      }
                    )
                  },
                  `${item.id}-${item.region_name}`
                );
              })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("aside", { className: "min-w-0 border border-[#202A3D] bg-[#101620]/95 p-4 sm:p-5", children: active ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.26em] text-[#7E8796]", children: "Hotspot selezionato" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-2xl font-semibold leading-tight text-[#F3F4F6]", children: active.region_name })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `shrink-0 border px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] ${severityClasses[active.severity]?.border} ${severityClasses[active.severity]?.bg} ${severityClasses[active.severity]?.text}`, children: severityClasses[active.severity]?.label })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(SignalBox, { icon: Crosshair, label: "Rischio", value: active.risk_score }),
          /* @__PURE__ */ jsx(SignalBox, { icon: MapPin, label: "Coordinate", value: `${formatCoordinate(active.lat, "lat")} / ${formatCoordinate(active.long, "long")}` })
        ] }),
        /* @__PURE__ */ jsx(
          ArticleCoverImage,
          {
            item: active,
            className: "mt-5 h-40 border border-[#202A3D]",
            loading: "eager",
            fetchPriority: "high",
            sizes: "(min-width: 1024px) 320px, 100vw",
            width: 1200,
            height: 630
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-5 font-mono text-sm leading-7 text-[#B8C2D2]", children: active.title }),
        active.url && /* @__PURE__ */ jsxs(
          Link,
          {
            href: active.url,
            className: "mt-5 inline-flex w-full items-center justify-center gap-2 border border-[#D7B56D]/40 bg-[#D7B56D]/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[#FDE68A] transition hover:border-[#D7B56D]/70 hover:bg-[#D7B56D]/15",
            children: [
              "Apri dossier",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex min-h-80 items-center justify-center text-center font-mono text-sm uppercase tracking-[0.24em] text-[#7E8796]", children: "Nessun hotspot attivo" }) })
    ] })
  ] });
}
function SignalBox({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "border border-[#202A3D] bg-[#0B0F15] p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7E8796]", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 truncate font-mono text-sm text-[#E8EDF5]", children: value })
  ] });
}
function TacticalTicker({ items }) {
  if (items.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx("section", { className: "mt-6 overflow-hidden border-y border-[#202A3D] bg-[#0B0F15] py-3", children: /* @__PURE__ */ jsx(Marquee, { gradient: false, speed: 28, pauseOnHover: true, children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: "mx-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#9CA3AF]", children: [
    /* @__PURE__ */ jsx(RadioTower, { className: "h-4 w-4 text-[#D7B56D]" }),
    /* @__PURE__ */ jsx("span", { className: "text-[#D7B56D]", children: item.operation_code }),
    /* @__PURE__ */ jsxs("span", { children: [
      formatCoordinate(item.lat, "lat"),
      " / ",
      formatCoordinate(item.long, "long")
    ] }),
    /* @__PURE__ */ jsx("span", { className: "max-w-[420px] truncate text-[#E8EDF5]", children: item.title })
  ] }, `${item.id}-${item.title}`)) }) });
}
function IntelligenceCard({ item, index }) {
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
        { icon: MapPin, value: item.region_name || "Hotspot" },
        {
          icon: TrendIcon,
          value: trendCopy[item.trend_direction]?.label || "Stabile"
        }
      ]
    }
  );
}
function EmptyState() {
  return /* @__PURE__ */ jsx("div", { className: "border border-dashed border-[#2A354D] bg-[#101620] p-8 text-[#9CA3AF]", children: "La sala operativa si popolera automaticamente con le prime analisi pubblicate." });
}
function Welcome({
  latestArticles = [],
  briefingArticles = [],
  locations = [],
  tickerItems = [],
  stats = {}
}) {
  const operations = useMemo(() => normalizeOperations(locations, []), [locations]);
  const feedItems = operations.length > 0 ? operations : normalizeOperations([], latestArticles);
  const statItems = [
    { label: "Dossier", value: stats.articlesCount || 0, icon: FileSearch },
    { label: "Hotspot", value: stats.hotspotsCount || operations.length, icon: Target },
    { label: "Agg.", value: formatDate(stats.latestPublishedAt), icon: Binary }
  ];
  const description = "Analisi geopolitiche, dossier internazionali e briefing AI su crisi, sicurezza, energia e hotspot globali monitorati in tempo reale.";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Linea di gioco",
    url: route("home"),
    inLanguage: "it-IT",
    description
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Analisi geopolitiche e dossier internazionali",
        description,
        canonicalUrl: route("home"),
        keywords: [
          "geopolitica",
          "analisi geopolitica",
          "dossier internazionali",
          "crisi internazionali",
          "intelligence open source"
        ],
        structuredData
      }
    ),
    /* @__PURE__ */ jsxs(BlogLayout, { children: [
      /* @__PURE__ */ jsx(GlobalMap, { operations }),
      /* @__PURE__ */ jsx(TacticalTicker, { items: operations.length > 0 ? operations : [] }),
      /* @__PURE__ */ jsx("section", { className: "mt-8 sm:mt-12 grid gap-4 md:grid-cols-3", children: statItems.map((item) => /* @__PURE__ */ jsxs("div", { className: "border border-[#202A3D] bg-[#101620] p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.24em] text-[#7E8796]", children: item.label }),
          /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5 text-[#D7B56D]" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 font-mono text-2xl font-semibold text-[#E8EDF5]", children: item.value })
      ] }, item.label)) }),
      /* @__PURE__ */ jsxs("section", { className: "mt-10 sm:mt-14", children: [
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
        feedItems.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3", children: feedItems.slice(0, 9).map((item, index) => /* @__PURE__ */ jsx(IntelligenceCard, { item, index }, `${item.id}-${item.operation_code}`)) }) : /* @__PURE__ */ jsx(EmptyState, {})
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-10 sm:mt-14 grid gap-6 border border-[#202A3D] bg-[#101620] p-4 sm:p-6 lg:grid-cols-[0.75fr_1.25fr]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10 text-[#D7B56D]", children: /* @__PURE__ */ jsx(Radar, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("p", { className: "mt-5 font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]", children: "Briefing rapido" }),
          /* @__PURE__ */ jsx("h3", { className: "mt-2 font-serif text-3xl text-[#F3F4F6]", children: "Ultime finestre operative" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: briefingArticles.length > 0 ? briefingArticles.slice(0, 5).map((article) => /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("blog.articles.show", { id: article.id, slug: article.slug }),
            className: "grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 border border-[#202A3D] bg-[#0B0F15] p-3 transition hover:border-[#D7B56D]/50 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:gap-4",
            children: [
              /* @__PURE__ */ jsx(
                ArticleCoverImage,
                {
                  item: article,
                  compact: true,
                  className: "h-14 border border-[#182234]",
                  sizes: "76px",
                  width: 512,
                  height: 512
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate text-sm text-[#D7DEE8]", children: article.title }),
              /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4 w-4 shrink-0 text-[#D7B56D]" })
            ]
          },
          article.id
        )) : /* @__PURE__ */ jsx("p", { className: "text-sm text-[#9CA3AF]", children: "Nessun briefing disponibile." }) })
      ] })
    ] })
  ] });
}
export {
  Welcome as default
};
