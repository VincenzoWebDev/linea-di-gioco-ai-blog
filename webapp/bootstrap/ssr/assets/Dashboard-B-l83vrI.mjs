import { jsxs, jsx } from "react/jsx-runtime";
import { A as Authenticated } from "./AuthenticatedLayout-APLMBOY6.mjs";
import { Head } from "@inertiajs/react";
import { C as Card, c as CardHeader, b as CardDescription, d as CardTitle, a as CardContent } from "./card-DRB3Bbat.mjs";
import "react";
import "./ApplicationLogo-VXSMMN2A.mjs";
import "@headlessui/react";
import "lucide-react";
import "./SeoHead-9Gv-Y1Y7.mjs";
function StatGrid({ stats = [] }) {
  return /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2 xl:grid-cols-4", children: stats.map((stat) => /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `h-1 w-full bg-gradient-to-r ${stat.tone || "from-slate-300 to-slate-100"}`
      }
    ),
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardDescription, { children: stat.title }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: stat.value })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-emerald-600", children: stat.delta }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: stat.note })
    ] })
  ] }, stat.title)) });
}
function SectionGrid({ sections = [] }) {
  return /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: sections.map((section) => /* @__PURE__ */ jsxs(
    Card,
    {
      className: "transition hover:-translate-y-0.5 hover:shadow-md",
      children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: section.title }),
          /* @__PURE__ */ jsx(CardDescription, { children: section.description })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-700", children: section.meta }) })
      ]
    },
    section.title
  )) });
}
function QueueCard({ pendingByQueue = {} }) {
  const entries = Object.entries(pendingByQueue);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Code attive" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Job pendenti per coda Laravel" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: entries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Nessun job in coda." }) : entries.map(([queue, total]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: queue }),
      /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: total })
    ] }, queue)) })
  ] });
}
function RecentIncomingCard({ items = [] }) {
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Ultime notizie acquisite" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Stato reale degli ultimi item entrati" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Nessuna notizia recente." }) : items.map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 p-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-900", children: item.title }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center justify-between text-xs text-slate-500", children: [
        /* @__PURE__ */ jsx("span", { children: item.source || "Fonte sconosciuta" }),
        /* @__PURE__ */ jsx("span", { children: item.status })
      ] })
    ] }, item.id)) })
  ] });
}
function PipelineSummary({ pipeline = {}, content = {} }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Pipeline operativa" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Stato attuale di acquisizione e validazione" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Raw" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-slate-900", children: pipeline.status_breakdown?.raw ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Sanitized" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-slate-900", children: pipeline.status_breakdown?.sanitized ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Validated" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-slate-900", children: pipeline.status_breakdown?.validated ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Rejected" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-slate-900", children: pipeline.status_breakdown?.rejected ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Queued jobs" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-slate-900", children: pipeline.pending_jobs ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Extracted" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-slate-900", children: pipeline.status_breakdown?.extracted ?? 0 })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Stato articoli" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Situazione editoriale corrente" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Bozze" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: content.drafts ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "In revisione" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: content.review ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Pubblicati" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: content.published ?? 0 })
        ] })
      ] })
    ] })
  ] });
}
function Dashboard({
  auth,
  stats = [],
  overview = {},
  pipeline = {},
  content = {},
  sections = []
}) {
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Dashboard" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
        /* @__PURE__ */ jsx("div", { className: "py-10", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] space-y-8 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-10 text-white shadow-lg", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-slate-300", children: "Overview" }),
            /* @__PURE__ */ jsx("h3", { className: "mt-2 text-3xl font-semibold", children: overview.headline || "Contenuti e pipeline sotto controllo." }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-3xl text-sm text-slate-300", children: overview.subheadline || "Monitoraggio reale del sistema editoriale e della pipeline AI." })
          ] }),
          /* @__PURE__ */ jsx(StatGrid, { stats }),
          /* @__PURE__ */ jsx(PipelineSummary, { pipeline, content }),
          /* @__PURE__ */ jsx(SectionGrid, { sections }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsx(QueueCard, { pendingByQueue: pipeline.pending_by_queue }),
            /* @__PURE__ */ jsx(RecentIncomingCard, { items: pipeline.recent_incoming })
          ] })
        ] }) })
      ]
    }
  );
}
export {
  Dashboard as default
};
