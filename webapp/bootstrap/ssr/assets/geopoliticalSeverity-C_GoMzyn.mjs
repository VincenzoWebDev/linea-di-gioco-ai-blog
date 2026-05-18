import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { Image, ArrowRight } from "lucide-react";
function ArticleCoverImage({
  item,
  className = "",
  compact = false,
  alt,
  loading = "lazy",
  fetchPriority = "auto",
  sizes,
  width = 1200,
  height = 630,
  decoding = "async"
}) {
  const imageUrl = item?.cover_url || item?.thumb_url || item?.article?.cover_url || item?.article?.thumb_url;
  return /* @__PURE__ */ jsxs("div", { className: `relative overflow-hidden bg-[#0B0F15] ${className}`, children: [
    imageUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: imageUrl,
        alt: alt || item?.title || "Articolo",
        className: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
        loading,
        fetchpriority: fetchPriority,
        sizes,
        width,
        height,
        decoding
      }
    ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(215,181,109,0.16),transparent_32%),linear-gradient(135deg,rgba(31,58,95,0.5),rgba(11,15,21,0.96)_58%,rgba(158,42,43,0.24))]", children: /* @__PURE__ */ jsx(
      Image,
      {
        className: compact ? "h-5 w-5 text-[#D7B56D]/70" : "h-9 w-9 text-[#D7B56D]/70"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#080B10]/86 via-transparent to-transparent" })
  ] });
}
function DataChip({ icon: Icon, value }) {
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex max-w-full items-center gap-2 border border-[#202A3D] bg-[#0B0F15] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#9CA3AF]", children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 shrink-0 text-[#D7B56D]" }),
    /* @__PURE__ */ jsx("span", { className: "truncate", children: value })
  ] });
}
function formatPublishedAt(value) {
  if (!value) {
    return "Data n.d.";
  }
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
function ArticleIntelligenceCard({
  article,
  index = 0,
  href,
  ctaLabel = "Leggi dossier",
  chips = [],
  statusBadge = null,
  imageLoading = "lazy",
  imageFetchPriority = "auto",
  imageSizes = "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
}) {
  const targetHref = href || route("blog.articles.show", {
    id: article.id,
    slug: article.slug
  });
  const operationCode = article.operation_code || `OP-${String(article.id).padStart(4, "0")}`;
  const summary = article.summary || article.excerpt || "Briefing in aggiornamento automatico.";
  const revealDelay = Math.min(index * 60, 300);
  return /* @__PURE__ */ jsx(
    "article",
    {
      className: "group min-w-0 max-w-full opacity-0 animate-card-reveal overflow-hidden border border-[#202A3D] bg-[#101620] transition-[border-color,box-shadow] duration-300 hover:border-[#D7B56D]/50 hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] motion-reduce:animate-none motion-reduce:opacity-100",
      style: { animationDelay: `${revealDelay}ms` },
      children: /* @__PURE__ */ jsx("div", { className: "transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-1", children: /* @__PURE__ */ jsxs(Link, { href: targetHref, className: "block", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            ArticleCoverImage,
            {
              item: article,
              className: "h-48 border-b border-[#202A3D]",
              loading: imageLoading,
              fetchPriority: imageFetchPriority,
              sizes: imageSizes,
              width: 1200,
              height: 630
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 right-3 flex min-w-0 items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate border border-[#D7B56D]/40 bg-[#080B10]/82 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FDE68A] backdrop-blur sm:text-[11px] sm:tracking-[0.22em]", children: operationCode }),
            statusBadge ? /* @__PURE__ */ jsx(
              "span",
              {
                className: `shrink-0 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur sm:tracking-[0.18em] ${statusBadge.border} ${statusBadge.bg} ${statusBadge.text}`,
                children: statusBadge.label
              }
            ) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-5", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold leading-tight text-[#F3F4F6] sm:text-xl", children: article.title }),
          chips.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: chips.map((chip, chipIndex) => /* @__PURE__ */ jsx(
            DataChip,
            {
              icon: chip.icon,
              value: chip.value
            },
            `${chip.value}-${chipIndex}`
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "line-clamp-3 text-sm leading-6 text-[#AAB3C2]", children: summary }),
            /* @__PURE__ */ jsxs("div", { className: "mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#D7B56D]", children: [
              ctaLabel,
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition group-hover:translate-x-1" })
            ] })
          ] })
        ] })
      ] }) })
    }
  );
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
function severityBadge(severityKey) {
  const severity = severityClasses[severityKey] || severityClasses.low;
  return {
    label: severity.label,
    border: severity.border,
    bg: severity.bg,
    text: severity.text
  };
}
export {
  ArticleCoverImage as A,
  ArticleIntelligenceCard as a,
  severityClasses as b,
  formatPublishedAt as f,
  severityBadge as s
};
