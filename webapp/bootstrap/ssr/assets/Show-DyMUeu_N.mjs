import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, Suspense, lazy } from "react";
import { Link } from "@inertiajs/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Info, ExternalLink, MapPin, Clock3, RadioTower, FileSearch, ArrowLeft } from "lucide-react";
import { B as BlogLayout } from "./BlogLayout-CcevzCzS.mjs";
import { motion } from "framer-motion";
import { b as formatPublishedAt, f as formatDateTime, r as resolveSeverityThresholds, a as alertFromRiskScore } from "./geopoliticalSeverity-B4PJR-9p.mjs";
import { S as SeoHead } from "./SeoHead-9Gv-Y1Y7.mjs";
function safeText(value) {
  if (typeof value === "symbol") {
    return value.description || "";
  }
  if (value == null) {
    return "";
  }
  return String(value);
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function TooltipPanel({ term, entry }) {
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.92, y: 4 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { duration: 0.16, ease: "easeOut" },
      className: "z-50 max-w-xs border border-[#D7B56D]/40 bg-[#0B0F15]/95 px-4 py-3 font-mono text-sm text-[#D7DEE8] shadow-2xl shadow-black/40 backdrop-blur",
      children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.24em] text-[#D7B56D]", children: safeText(term) }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 leading-6", children: safeText(entry?.definition) }),
        entry?.importance && /* @__PURE__ */ jsxs("div", { className: "mt-3 border-t border-[#202A3D] pt-2 text-[11px] uppercase tracking-[0.2em] text-[#8FA0B6]", children: [
          "Importanza:",
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-[#F3F4F6]", children: safeText(entry.importance) })
        ] })
      ]
    }
  );
}
function GlossaryTooltip({ term, entry }) {
  const [isMounted, setIsMounted] = useState(false);
  const [usePopover, setUsePopover] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return void 0;
    }
    const mediaQuery = window.matchMedia(
      "(max-width: 767px), (pointer: coarse)"
    );
    const syncMode = () => setUsePopover(mediaQuery.matches);
    syncMode();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncMode);
      return () => mediaQuery.removeEventListener("change", syncMode);
    }
    mediaQuery.addListener(syncMode);
    return () => mediaQuery.removeListener(syncMode);
  }, []);
  const triggerClassName = "group inline-flex cursor-help items-baseline gap-1 border-b border-dotted border-[#D7B56D]/80 text-left text-[#F3F4F6] decoration-transparent transition hover:text-[#FDE68A]";
  if (!isMounted) {
    return /* @__PURE__ */ jsxs("span", { className: triggerClassName, children: [
      /* @__PURE__ */ jsx("span", { children: term }),
      /* @__PURE__ */ jsx(
        Info,
        {
          className: "h-3 w-3 translate-y-[1px] opacity-70",
          "aria-hidden": "true"
        }
      )
    ] });
  }
  const trigger = /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: () => {
        if (usePopover) {
          setIsOpen((current) => !current);
        }
      },
      className: triggerClassName,
      children: [
        /* @__PURE__ */ jsx("span", { children: term }),
        /* @__PURE__ */ jsx(Info, { className: "h-3 w-3 translate-y-[1px] opacity-70 transition group-hover:opacity-100" })
      ]
    }
  );
  if (usePopover) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      trigger,
      isOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": `Chiudi dettaglio ${safeText(term)}`,
            className: "fixed inset-0 z-40 bg-black/30",
            onClick: () => setIsOpen(false)
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "fixed inset-x-4 bottom-4 z-50", children: /* @__PURE__ */ jsxs("div", { className: "relative border border-[#D7B56D]/40 bg-[#0B0F15]/95 px-4 py-3 font-mono text-sm text-[#D7DEE8] shadow-2xl shadow-black/40 backdrop-blur", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "aria-label": `Chiudi dettaglio ${safeText(term)}`,
              className: "absolute right-3 top-3 text-xs uppercase tracking-[0.2em] text-[#8FA0B6]",
              onClick: () => setIsOpen(false),
              children: "Chiudi"
            }
          ),
          /* @__PURE__ */ jsx(TooltipPanel, { term, entry })
        ] }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(Tooltip.Root, { delayDuration: 120, children: [
    /* @__PURE__ */ jsx(Tooltip.Trigger, { asChild: true, children: trigger }),
    /* @__PURE__ */ jsx(Tooltip.Portal, { children: /* @__PURE__ */ jsx(
      Tooltip.Content,
      {
        side: "top",
        align: "center",
        sideOffset: 10,
        collisionPadding: 16,
        asChild: true,
        children: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(TooltipPanel, { term, entry }),
          /* @__PURE__ */ jsx(Tooltip.Arrow, { className: "fill-[#D7B56D]/40" })
        ] })
      }
    ) })
  ] });
}
function glossaryRegex(glossary) {
  const terms = Object.keys(glossary || {}).sort(
    (a, b) => b.length - a.length
  );
  if (terms.length === 0) {
    return null;
  }
  return new RegExp(
    `(?<![\\p{L}\\p{N}])(${terms.map(escapeRegExp).join("|")})(?![\\p{L}\\p{N}])`,
    "giu"
  );
}
function splitContentBlocks(content) {
  return safeText(content).split(/\n{2,}/).map((block) => safeText(block).trim()).filter(Boolean);
}
function renderGlossaryText(text, glossary) {
  const regex = glossaryRegex(glossary);
  const normalizedText = safeText(text);
  if (!regex) {
    return normalizedText;
  }
  const parts = normalizedText.split(regex);
  return parts.map((part, index) => {
    const normalizedPart = safeText(part);
    const term = Object.keys(glossary).find(
      (item) => safeText(item).toLowerCase() === normalizedPart.toLowerCase()
    );
    if (!term) {
      return normalizedPart;
    }
    return /* @__PURE__ */ jsx(
      GlossaryTooltip,
      {
        term,
        entry: glossary[term]
      },
      `${normalizedPart}-${index}`
    );
  });
}
function ArticleGlossaryContent({ content, glossary = {} }) {
  return splitContentBlocks(content).map((text, index) => {
    const isHeading = text.length < 90 && !text.includes(".") && index > 0;
    if (isHeading) {
      return /* @__PURE__ */ jsx(
        "h2",
        {
          className: "mt-10 font-serif text-3xl leading-tight text-[#F3F4F6]",
          children: renderGlossaryText(text, glossary)
        },
        `${text}-${index}`
      );
    }
    return /* @__PURE__ */ jsx(
      "p",
      {
        className: "mt-6 whitespace-pre-line leading-[1.9] text-[#D7DEE8]",
        children: renderGlossaryText(text, glossary)
      },
      `${text}-${index}`
    );
  });
}
function ArticleShowBody({ article, glossary }) {
  return /* @__PURE__ */ jsxs("main", { className: "min-w-0", children: [
    /* @__PURE__ */ jsx("div", { className: "border-l border-[#2A354D] pl-4 sm:pl-5", children: /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.3em] text-[#7E8796]", children: "Rapporto sintetico" }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words text-base sm:text-lg", children: /* @__PURE__ */ jsx(
      ArticleGlossaryContent,
      {
        content: article.content,
        glossary
      }
    ) }),
    article.source_url ? /* @__PURE__ */ jsxs(
      "a",
      {
        href: article.source_url,
        target: "_blank",
        rel: "noreferrer",
        className: "mt-10 inline-flex items-center gap-2 border border-[#2A354D] bg-[#121722] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2] transition hover:border-[#D7B56D]/60 hover:text-[#F3F4F6]",
        children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
          "Fonte"
        ]
      }
    ) : article.source_name ? /* @__PURE__ */ jsxs("div", { className: "mt-10 inline-flex items-center gap-2 border border-[#2A354D] bg-[#121722] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#AAB3C2]", children: [
      /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" }),
      "Fonte: ",
      article.source_name
    ] }) : null
  ] });
}
function ArticleShowCover({ article }) {
  if (!article.cover_url) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "mt-8 overflow-hidden border border-[#202A3D] bg-[#0B0F15]", children: /* @__PURE__ */ jsx(
    "img",
    {
      src: article.cover_url,
      alt: article.title,
      className: "h-52 w-full object-cover sm:h-72 md:h-[460px]",
      loading: "eager",
      fetchpriority: "high",
      decoding: "async",
      sizes: "(min-width: 768px) 1200px, 100vw",
      width: 1200,
      height: 630
    }
  ) });
}
function ArticleMeta({ topic, publishedAt }) {
  const dateLabel = publishedAt ? formatPublishedAt(publishedAt) : null;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#6B7280]", children: [
    topic && /* @__PURE__ */ jsx("span", { children: topic }),
    topic && dateLabel && /* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-[#1C2333]" }),
    dateLabel && /* @__PURE__ */ jsx("span", { children: dateLabel })
  ] });
}
function ArticleDataPill({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 border-t border-[#2A354D] px-4 py-3 first:border-t-0 sm:border-l sm:border-t-0 sm:py-2 sm:first:border-l-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#7E8796]", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono text-sm text-[#E8EDF5]", children: value })
  ] });
}
function ArticleShowHeader({ article, intelligence }) {
  const timestamp = article.tension?.updated_at || article.updated_at || article.published_at;
  return /* @__PURE__ */ jsxs("header", { className: "mt-6 border-b border-[#202A3D] pb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxs(
        "span",
        {
          className: `border px-3 py-1 font-mono text-xs uppercase tracking-[0.22em] ${intelligence.alertClasses}`,
          children: [
            "Allerta ",
            intelligence.alertLevel
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        ArticleMeta,
        {
          topic: article.topic,
          publishedAt: article.published_at
        }
      )
    ] }),
    /* @__PURE__ */ jsx("h1", { className: "mt-5 max-w-5xl font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-6xl", children: article.title }),
    article.summary && /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-3xl text-lg leading-8 text-[#AAB3C2] sm:mt-6 sm:text-xl", children: article.summary }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid overflow-hidden border border-[#202A3D] bg-[#101620] sm:mt-8 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        ArticleDataPill,
        {
          icon: MapPin,
          label: "Coordinate",
          value: intelligence.coordinates
        }
      ),
      /* @__PURE__ */ jsx(
        ArticleDataPill,
        {
          icon: Clock3,
          label: "Ultimo aggiornamento",
          value: formatDateTime(timestamp)
        }
      ),
      /* @__PURE__ */ jsx(
        ArticleDataPill,
        {
          icon: RadioTower,
          label: "Area",
          value: article.tension?.region_name || article.topic || "Dossier globale"
        }
      )
    ] })
  ] });
}
function ArticleRelatedCard({ article }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: route("blog.articles.show", {
        id: article.id,
        slug: article.slug
      }),
      className: "group grid grid-cols-1 gap-3 rounded-lg border border-[#202A3D] bg-[#121722] p-3 transition hover:border-[#D7B56D]/50 sm:grid-cols-[88px_1fr] sm:gap-4",
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-36 w-full overflow-hidden rounded-md bg-[#0B0F15] sm:h-20 sm:w-[88px]", children: article.thumb_url ? /* @__PURE__ */ jsx(
          "img",
          {
            src: article.thumb_url,
            alt: article.title,
            className: "h-full w-full object-cover",
            loading: "lazy",
            decoding: "async",
            width: 384,
            height: 384
          }
        ) : /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-[#182234]" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-serif text-lg leading-tight text-[#E8EDF5] group-hover:text-white", children: article.title }),
          /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
            ArticleMeta,
            {
              topic: article.topic,
              publishedAt: article.published_at
            }
          ) }),
          article.match_reason && /* @__PURE__ */ jsx("p", { className: "mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#D7B56D]", children: article.match_reason })
        ] })
      ]
    }
  );
}
function ArticleShowRelatedSection({ related = [] }) {
  return /* @__PURE__ */ jsxs("section", { className: "mt-12 border border-[#202A3D] bg-[#101620] p-4 sm:mt-16 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-start md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.28em] text-[#7E8796]", children: "Prossimi passaggi" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-3xl text-[#F3F4F6]", children: "Prossimi step consigliati" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-[#AAB3C2]", children: "Selezione di dossier affini per area, categoria o lessico operativo, così il contesto resta coerente e confrontabile." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10 text-[#D7B56D]", children: /* @__PURE__ */ jsx(FileSearch, { className: "h-5 w-5" }) })
    ] }),
    related.length > 0 ? /* @__PURE__ */ jsx("div", { className: "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: related.map((item) => /* @__PURE__ */ jsx(ArticleRelatedCard, { article: item }, item.id)) }) : /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm text-[#9CA3AF]", children: "Nessun dossier affine disponibile al momento." })
  ] });
}
const regionCoordinates = [
  { match: "medio oriente", label: "31.7683 N / 35.2137 E" },
  { match: "europa", label: "50.1109 N / 8.6821 E" },
  { match: "africa", label: "9.0820 N / 8.6753 E" },
  { match: "asia", label: "34.0479 N / 100.6197 E" },
  { match: "ucraina", label: "50.4501 N / 30.5234 E" },
  { match: "russia", label: "55.7558 N / 37.6173 E" },
  { match: "cina", label: "39.9042 N / 116.4074 E" },
  { match: "usa", label: "38.9072 N / 77.0369 W" },
  { match: "stati uniti", label: "38.9072 N / 77.0369 W" },
  { match: "mediterraneo", label: "35.0000 N / 18.0000 E" }
];
function findCoordinates(article) {
  const region = [
    article.tension?.region_name,
    article.topic,
    ...article.categories || [],
    article.title
  ].filter(Boolean).join(" ").toLowerCase();
  return regionCoordinates.find((item) => region.includes(item.match))?.label || "41.9028 N / 12.4964 E";
}
function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(Number(value) || 0)));
}
function buildIntelligence(article, riskThresholds = {}) {
  const tensionScore = article.tension?.current_tension ?? article.tension?.risk_score ?? null;
  const hasTension = tensionScore != null;
  const riskScore = clamp(hasTension ? tensionScore : 38);
  const qualityScore = clamp(article.quality_score ?? 55);
  const trendBump = article.tension?.trend_direction === "rising" ? 5 : article.tension?.trend_direction === "falling" ? -4 : 0;
  const metrics = [
    { axis: "Militare", value: clamp(riskScore + trendBump + 2) },
    { axis: "Economico", value: clamp(riskScore * 0.88 + 4) },
    { axis: "Diplomatico", value: clamp(riskScore * 0.78 + trendBump) },
    {
      axis: "Energia",
      value: clamp(riskScore * 0.72 + (article.topic ? 6 : 0))
    },
    {
      axis: "Informativo",
      value: clamp(qualityScore * 0.75 + riskScore * 0.2)
    }
  ];
  const averageImpact = clamp(
    metrics.reduce((sum, item) => sum + item.value, 0) / metrics.length
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
    scenario: Array.isArray(article.future_scenarios) && article.future_scenarios[0] ? article.future_scenarios[0] : riskScore >= scenarioHigh ? "Probabile intensificazione della pressione diplomatica e aumento della sorveglianza nelle prossime finestre operative." : "Scenario in consolidamento: monitorare segnali politici, catene logistiche e variazioni nella postura militare regionale.",
    hasTension
  };
}
const ArticleShowIntelligenceSidebar = lazy(
  () => import("./ArticleShowIntelligenceSidebar-q01Pav81.mjs")
);
function buildMetaDescription(article) {
  if (article.summary) {
    return article.summary;
  }
  const excerpt = safeText(article.content).replace(/\s+/g, " ").trim().slice(0, 157);
  return excerpt ? `${excerpt}...` : "";
}
function ArticlesShow({
  article,
  related = [],
  glossary = {},
  riskThresholds = {},
  newsArticleSchema = null
}) {
  const intelligence = buildIntelligence(article, riskThresholds);
  const canonicalUrl = route("blog.articles.show", {
    id: article.id,
    slug: article.slug
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: article.title,
        description: buildMetaDescription(article),
        canonicalUrl,
        image: article.cover_url || article.thumb_url,
        type: "article",
        keywords: article.categories || [],
        publishedTime: article.published_at,
        modifiedTime: article.updated_at || article.published_at,
        section: article.topic || article.categories?.[0] || "Geopolitica",
        structuredData: newsArticleSchema
      }
    ),
    /* @__PURE__ */ jsx(BlogLayout, { children: /* @__PURE__ */ jsxs(Tooltip.Provider, { children: [
      /* @__PURE__ */ jsxs("article", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("blog.articles.index"),
            className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#9CA3AF] transition hover:text-[#E5E7EB]",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
              "Torna agli articoli"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          ArticleShowHeader,
          {
            article,
            intelligence
          }
        ),
        /* @__PURE__ */ jsx(ArticleShowCover, { article }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_430px]", children: [
          /* @__PURE__ */ jsx(
            ArticleShowBody,
            {
              article,
              glossary
            }
          ),
          /* @__PURE__ */ jsx(
            Suspense,
            {
              fallback: /* @__PURE__ */ jsx("aside", { className: "min-w-0 max-w-full lg:sticky lg:top-8 lg:self-start", children: /* @__PURE__ */ jsx("div", { className: "border border-[#202A3D] bg-[#0B0F15]/90 p-4 shadow-2xl shadow-black/20 sm:p-5", children: /* @__PURE__ */ jsx("div", { className: "h-[420px] animate-pulse border border-[#182234] bg-[#121722]" }) }) }),
              children: /* @__PURE__ */ jsx(
                ArticleShowIntelligenceSidebar,
                {
                  article,
                  intelligence
                }
              )
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(ArticleShowRelatedSection, { related })
    ] }) })
  ] });
}
export {
  ArticlesShow as default
};
