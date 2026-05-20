import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { B as BlogLayout } from "./BlogLayout-BFsNo22r.mjs";
import { S as SeoHead } from "./SeoHead-9Gv-Y1Y7.mjs";
import { Link } from "@inertiajs/react";
import "react";
import "lucide-react";
function Contact() {
  const canonicalUrl = route("contact");
  const description = "Contatta la redazione di Linea di Gioco per segnalazioni, richieste e comunicazioni editoriali.";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Contatti",
        description,
        canonicalUrl,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contatti Linea di Gioco",
          url: canonicalUrl,
          inLanguage: "it-IT",
          description
        }
      }
    ),
    /* @__PURE__ */ jsx(BlogLayout, { children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-16 text-zinc-200", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white", children: "Contatti" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-relaxed text-zinc-300", children: "Per segnalazioni, richieste o informazioni e possibile contattare la redazione tramite email." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 space-y-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-zinc-400", children: "Email" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "mailto:vincenzo.dev.97@gmail.com",
              className: "text-white hover:underline",
              children: "vincenzo.dev.97@gmail.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 text-xs text-zinc-500", children: "Le richieste vengono valutate nel piu breve tempo possibile." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 text-xs text-zinc-400", children: /* @__PURE__ */ jsx(
        Link,
        {
          href: route("privacy-policy"),
          className: "hover:text-white",
          children: "Privacy Policy"
        }
      ) })
    ] }) })
  ] });
}
export {
  Contact as default
};
