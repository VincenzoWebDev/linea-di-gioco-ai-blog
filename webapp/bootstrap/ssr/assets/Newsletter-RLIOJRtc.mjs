import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { ArrowRight, Newspaper, ShieldCheck, Mail } from "lucide-react";
import { B as BlogLayout } from "./BlogLayout-dHfOtNNK.mjs";
import { S as SeoHead } from "./SeoHead-Bfgu-MHE.mjs";
import "react";
function Newsletter({ stats = {} }) {
  const items = [
    {
      icon: Newspaper,
      title: "Selezione ragionata",
      description: "Una sintesi delle analisi piu rilevanti senza dispersione."
    },
    {
      icon: ShieldCheck,
      title: "Focus strategico",
      description: "Geopolitica, sicurezza, energia e aree di frizione lette con priorita chiare."
    },
    {
      icon: Mail,
      title: "Formato semplice",
      description: "Un unico punto di accesso, piu ordinato rispetto a una CTA dentro la home."
    }
  ];
  const description = "Iscriviti alla newsletter di Linea di gioco per ricevere analisi geopolitiche, briefing strategici e selezioni editoriali sui dossier più rilevanti.";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Newsletter geopolitica",
        description,
        canonicalUrl: route("newsletter"),
        keywords: [
          "newsletter geopolitica",
          "newsletter analisi internazionale",
          "briefing geopolitico",
          "newsletter sicurezza internazionale"
        ],
        structuredData: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Newsletter Linea di gioco",
          url: route("newsletter"),
          inLanguage: "it-IT",
          description
        }
      }
    ),
    /* @__PURE__ */ jsxs(BlogLayout, { children: [
      /* @__PURE__ */ jsxs("section", { className: "grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.35em] text-[#9CA3AF]", children: "Newsletter" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-4 font-serif text-4xl leading-tight text-[#E5E7EB] sm:text-5xl", children: "Una pagina dedicata per iscriversi senza interrompere la navigazione del blog." }),
          /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-2xl text-[#9CA3AF]", children: "Ho separato il percorso newsletter dalla home per evitare comportamenti ambigui di scroll e mantenere la UX piu pulita." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-4", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("blog.articles.index"),
                className: "inline-flex items-center gap-2 rounded-full bg-[#1F3A5F] px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#23456f]",
                children: [
                  "Leggi le ultime notizie",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("home"),
                className: "rounded-full border border-[#1C2333] px-6 py-3 text-sm uppercase tracking-[0.2em] text-[#9CA3AF] transition hover:border-[#9E2A2B] hover:text-[#E5E7EB]",
                children: "Torna alla home"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] border border-[#1C2333] bg-gradient-to-br from-[#131823] via-[#151c28] to-[#1F3A5F]/35 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.24)]", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-[#6B7280]", children: "Iscrizione" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-4 font-serif text-3xl text-[#E5E7EB]", children: "Lascia la tua email" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-[#9CA3AF]", children: "Per ora questa pagina prepara il flusso UX corretto. Il collegamento a un form reale o a un provider email puo essere aggiunto nel prossimo passaggio." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                "aria-label": "Email newsletter",
                placeholder: "nome@azienda.it",
                className: "w-full rounded-2xl border border-[#1C2333] bg-[#0E1116] px-5 py-4 text-sm text-[#E5E7EB] placeholder:text-[#6B7280] focus:border-[#1F3A5F] focus:outline-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "w-full rounded-2xl bg-[#9E2A2B] px-6 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#b33435]",
                children: "Iscrivimi"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#1C2333] bg-[#0E1116]/70 p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-[0.24em] text-[#6B7280]", children: "Articoli pubblicati" }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 text-lg font-semibold text-[#E5E7EB]", children: stats.articlesCount || 0 })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#1C2333] bg-[#0E1116]/70 p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-[0.24em] text-[#6B7280]", children: "Aree tematiche" }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 text-lg font-semibold text-[#E5E7EB]", children: stats.categoriesCount || 0 })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "mt-16 grid gap-6 lg:grid-cols-3", children: items.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          "article",
          {
            className: "rounded-[2rem] border border-[#1C2333] bg-[#131823] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)]",
            children: [
              /* @__PURE__ */ jsx("div", { className: "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1C2333] text-[#E5E7EB]", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("h3", { className: "mt-5 font-serif text-2xl text-[#E5E7EB]", children: item.title }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-[#9CA3AF]", children: item.description })
            ]
          },
          item.title
        );
      }) })
    ] })
  ] });
}
export {
  Newsletter as default
};
