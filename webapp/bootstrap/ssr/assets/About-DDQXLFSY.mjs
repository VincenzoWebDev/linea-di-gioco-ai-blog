import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { B as BlogLayout } from "./BlogLayout-Do41-7kv.mjs";
import { S as SeoHead } from "./SeoHead-9Gv-Y1Y7.mjs";
import { Link } from "@inertiajs/react";
import "react";
import "lucide-react";
function About() {
  const canonicalUrl = route("about");
  const description = "Linea di Gioco è un progetto editoriale dedicato all’analisi geopolitica globale, con focus su sicurezza internazionale, energia e intelligence open source.";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Chi Siamo",
        description,
        canonicalUrl,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Chi Siamo - Linea di Gioco",
          url: canonicalUrl,
          inLanguage: "it-IT",
          description
        }
      }
    ),
    /* @__PURE__ */ jsx(BlogLayout, { children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-16 text-zinc-200", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white", children: "Chi Siamo" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-zinc-300", children: "Linea di Gioco è un progetto editoriale indipendente dedicato all’analisi della geopolitica globale. Il suo obiettivo è offrire una lettura chiara e strutturata degli eventi internazionali che influenzano gli equilibri tra Stati e regioni del mondo." }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-zinc-300", children: "Il sistema editoriale combina automazione nella raccolta e rielaborazione delle notizie con una supervisione umana che verifica coerenza, rilevanza e qualità dei contenuti prima della pubblicazione." }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-zinc-300", children: "Il focus del progetto riguarda geopolitica, sicurezza internazionale, dinamiche energetiche e intelligence open source (OSINT), con particolare attenzione ai contesti di crisi e alle evoluzioni strategiche globali." }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-zinc-300", children: "Lo stile editoriale è pensato per essere informativo e accessibile, evitando tecnicismi e mantenendo un taglio giornalistico chiaro e diretto." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 flex gap-4 text-xs text-zinc-400", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("privacy-policy"),
            className: "hover:text-white",
            children: "Privacy Policy"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("contact"),
            className: "hover:text-white",
            children: "Contatti"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  About as default
};
