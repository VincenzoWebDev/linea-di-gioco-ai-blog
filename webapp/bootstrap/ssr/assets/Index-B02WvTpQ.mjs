import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { ArrowLeft, FileSearch, MapPin, Activity, TrendingDown, TrendingUp, Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import { B as BlogLayout } from "./BlogLayout-DZ2SoYAz.mjs";
import { S as SeoHead } from "./SeoHead-Bfgu-MHE.mjs";
import { a as ArticleIntelligenceCard, s as severityBadge, f as formatPublishedAt } from "./geopoliticalSeverity-C_GoMzyn.mjs";
import "react";
const trendCopy = {
  rising: { label: "Escalation", icon: TrendingUp },
  falling: { label: "Decompressione", icon: TrendingDown },
  stable: { label: "Stabile", icon: Activity }
};
function buildArticleChips(article) {
  const chips = [];
  const region = article.region_name || article.topic || (Array.isArray(article.categories) ? article.categories[0] : null);
  if (region) {
    chips.push({
      icon: MapPin,
      value: region
    });
  }
  const trend = trendCopy[article.trend_direction];
  if (trend) {
    chips.push({
      icon: trend.icon,
      value: trend.label
    });
  }
  chips.push({
    icon: Clock3,
    value: formatPublishedAt(article.published_at)
  });
  return chips;
}
function EmptyArchive() {
  return /* @__PURE__ */ jsxs("div", { className: "border border-dashed border-[#2A354D] bg-[#101620] p-10 text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.28em] text-[#7E8796]", children: "Archivio vuoto" }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-[#9CA3AF]", children: "Non ci sono ancora dossier pubblicati. Torna presto per nuove analisi." })
  ] });
}
function Pagination({ articles }) {
  if (articles.last_page <= 1) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row", children: [
    /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs uppercase tracking-[0.2em] text-[#7E8796]", children: [
      "Pagina ",
      articles.current_page,
      " di ",
      articles.last_page
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      articles.prev_page_url ? /* @__PURE__ */ jsxs(
        Link,
        {
          href: articles.prev_page_url,
          preserveScroll: true,
          className: "inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 text-sm text-[#AAB3C2] transition hover:border-[#D7B56D] hover:text-[#D7B56D]",
          children: [
            /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
            "Precedente"
          ]
        }
      ) : /* @__PURE__ */ jsxs("div", { className: "inline-flex cursor-not-allowed items-center gap-2 border border-[#1B2435] bg-[#0D121B] px-4 py-2 text-sm text-[#4B5563]", children: [
        /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
        "Precedente"
      ] }),
      articles.next_page_url ? /* @__PURE__ */ jsxs(
        Link,
        {
          href: articles.next_page_url,
          preserveScroll: true,
          className: "inline-flex items-center gap-2 border border-[#2A354D] bg-[#101620] px-4 py-2 text-sm text-[#AAB3C2] transition hover:border-[#D7B56D] hover:text-[#D7B56D]",
          children: [
            "Successiva",
            /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
          ]
        }
      ) : /* @__PURE__ */ jsxs("div", { className: "inline-flex cursor-not-allowed items-center gap-2 border border-[#1B2435] bg-[#0D121B] px-4 py-2 text-sm text-[#4B5563]", children: [
        "Successiva",
        /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
      ] })
    ] })
  ] });
}
function ArticlesIndex({
  articles = {
    data: []
  },
  stats = {}
}) {
  const items = articles.data ?? [];
  const total = stats.total ?? articles.total ?? items.length;
  const page = articles.current_page || 1;
  const canonicalUrl = page > 1 ? `${route("blog.articles.index")}?page=${page}` : route("blog.articles.index");
  const description = "Archivio completo dei dossier di Linea di gioco: analisi geopolitiche su crisi, sicurezza, energia, conflitti e scenari internazionali.";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Archivio dossier di Linea di gioco",
    url: canonicalUrl,
    inLanguage: "it-IT",
    description
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: page > 1 ? `Archivio dossier pagina ${page}` : "Archivio dossier geopolitici",
        description,
        canonicalUrl,
        keywords: [
          "archivio geopolitica",
          "dossier geopolitici",
          "analisi internazionali",
          "sicurezza internazionale",
          "conflitti globali"
        ],
        structuredData
      }
    ),
    /* @__PURE__ */ jsxs(BlogLayout, { children: [
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" }),
        /* @__PURE__ */ jsxs("div", { className: "relative p-4 sm:p-5 lg:p-8", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: route("home"),
              className: "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9CA3AF] transition hover:text-[#D7B56D]",
              children: [
                /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Sala operativa"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap items-end justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]", children: "Archivio analisi" }),
              /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-5xl", children: "File declassificati" }),
              /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl text-sm leading-7 text-[#AAB3C2]", children: "Tutti i dossier geopolitici pubblicati: analisi su crisi, sicurezza, energia ed equilibri internazionali." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]", children: [
              /* @__PURE__ */ jsx(FileSearch, { className: "h-4 w-4 text-[#D7B56D]" }),
              total,
              " dossier"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "mt-8 sm:mt-10", children: items.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3", children: items.map((article, index) => /* @__PURE__ */ jsx(
          ArticleIntelligenceCard,
          {
            article,
            index,
            chips: buildArticleChips(article),
            statusBadge: severityBadge(
              article.severity
            ),
            ctaLabel: "Apri dossier",
            imageLoading: index === 0 ? "eager" : "lazy",
            imageFetchPriority: index === 0 ? "high" : "auto"
          },
          article.id
        )) }),
        /* @__PURE__ */ jsx(Pagination, { articles })
      ] }) : /* @__PURE__ */ jsx(EmptyArchive, {}) })
    ] })
  ] });
}
export {
  ArticlesIndex as default
};
