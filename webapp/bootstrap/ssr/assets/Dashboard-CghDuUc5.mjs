import { jsxs, jsx } from "react/jsx-runtime";
import { A as Authenticated } from "./AuthenticatedLayout-Bc07UTqA.mjs";
import { Head } from "@inertiajs/react";
import { C as Card, c as CardHeader, b as CardDescription, d as CardTitle, a as CardContent } from "./card-DRB3Bbat.mjs";
import "react";
import "./ApplicationLogo-VXSMMN2A.mjs";
import "@headlessui/react";
import "lucide-react";
import "./SeoHead-9Gv-Y1Y7.mjs";
function DashboardHero({ overview = {} }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-10 text-white shadow-lg", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-slate-300", children: "Overview" }),
    /* @__PURE__ */ jsx("h3", { className: "mt-2 text-3xl font-semibold", children: overview.headline || "Contenuti e pipeline sotto controllo." }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-3xl text-sm text-slate-300", children: overview.subheadline || "Monitoraggio reale del sistema editoriale e della pipeline AI." })
  ] });
}
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
function PipelineSummary({ pipeline = {}, content = {} }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Pipeline operativa" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Stato attuale di acquisizione e validazione" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
        ["Raw", pipeline.status_breakdown?.raw ?? 0],
        ["Sanitized", pipeline.status_breakdown?.sanitized ?? 0],
        ["Validated", pipeline.status_breakdown?.validated ?? 0],
        ["Rejected", pipeline.status_breakdown?.rejected ?? 0],
        ["Queued jobs", pipeline.pending_jobs ?? 0],
        ["Extracted", pipeline.status_breakdown?.extracted ?? 0]
      ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: label }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-semibold text-slate-900", children: value })
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Stato articoli" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Situazione editoriale corrente" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: [
        ["Bozze", content.drafts ?? 0],
        ["In revisione", content.review ?? 0],
        ["Pubblicati", content.published ?? 0]
      ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: label }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: value })
      ] }, label)) })
    ] })
  ] });
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
function TensionsCard({ tensions = {} }) {
  const items = tensions.top || [];
  const latestUpdate = tensions.latest_update ? new Date(tensions.latest_update).toLocaleString("it-IT") : null;
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Tensioni attive" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Situazione sotto l'header del blog" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Totali" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-slate-900", children: tensions.total ?? 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-slate-50 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Rischio alto" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-slate-900", children: tensions.high ?? 0 })
        ] })
      ] }),
      latestUpdate && /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
        "Ultimo aggiornamento: ",
        latestUpdate
      ] }),
      items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Nessuna tensione disponibile." }) : items.map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-lg border border-slate-200 p-3",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-900", children: item.region_name }),
              /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: item.risk_score })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-500", children: item.status_label })
          ]
        },
        `${item.region_name}-${item.updated_at}`
      ))
    ] })
  ] });
}
function Dashboard({
  auth,
  stats = [],
  overview = {},
  pipeline = {},
  content = {},
  sections = [],
  tensions = {}
}) {
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold leading-tight text-gray-800", children: "Dashboard" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
        /* @__PURE__ */ jsx("div", { className: "py-10", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1400px] space-y-8 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsx(DashboardHero, { overview }),
          /* @__PURE__ */ jsx(StatGrid, { stats }),
          /* @__PURE__ */ jsx(PipelineSummary, { pipeline, content }),
          /* @__PURE__ */ jsx(SectionGrid, { sections }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsx(QueueCard, { pendingByQueue: pipeline.pending_by_queue }),
            /* @__PURE__ */ jsx(RecentIncomingCard, { items: pipeline.recent_incoming })
          ] }),
          /* @__PURE__ */ jsx(TensionsCard, { tensions })
        ] }) })
      ]
    }
  );
}
export {
  Dashboard as default
};
