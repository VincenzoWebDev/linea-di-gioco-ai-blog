import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("cookie_consent") || "null"
    );
    if (!saved) {
      setOpen(true);
    } else {
      setAnalytics(saved.analytics);
      setMarketing(saved.marketing);
    }
  }, []);
  function getAnonId() {
    let id = localStorage.getItem("anon_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("anon_id", id);
    }
    return id;
  }
  const save = async (data) => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({
        ...data,
        timestamp: Date.now()
      })
    );
    await fetch(route("cookie-consent"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
      },
      body: JSON.stringify({
        ...data,
        anon_id: getAnonId()
      })
    });
    window.dispatchEvent(new Event("cookie-consent-updated"));
    setOpen(false);
  };
  if (!open) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "cookie-banner-overlay fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm",
        "aria-hidden": true
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "cookie-banner-panel fixed inset-x-0 bottom-6 z-[9999] flex justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-zinc-800 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-zinc-100", children: "Cookie & Privacy" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-zinc-400", children: "Utilizziamo cookie tecnici e opzionali per migliorare la lettura delle notizie e analizzare il traffico." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex gap-4 text-xs", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("privacy-policy"),
              className: "text-zinc-400 underline hover:text-zinc-200",
              children: "Privacy Policy"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("cookie-policy"),
              className: "text-zinc-400 underline hover:text-zinc-200",
              children: "Cookie Policy"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-200", children: "Necessari" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: "Sempre attivi per il funzionamento del sito" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-500", children: "Sempre attivi" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-200", children: "Analytics" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: "Ci aiutano a capire come vengono letti gli articoli" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "h-4 w-4 accent-zinc-300",
              checked: analytics,
              onChange: (e) => setAnalytics(e.target.checked)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-200", children: "Personalizzazione" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500", children: "Contenuti consigliati in base alla lettura" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "h-4 w-4 accent-zinc-300",
              checked: marketing,
              onChange: (e) => setMarketing(e.target.checked)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-t border-zinc-800 p-5 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => save({
              necessary: true,
              analytics: false,
              marketing: false
            }),
            className: "rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900",
            children: "Rifiuta"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => save({
              necessary: true,
              analytics,
              marketing
            }),
            className: "rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-700",
            children: "Salva scelte"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => save({
              necessary: true,
              analytics: true,
              marketing: true
            }),
            className: "rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200",
            children: "Accetta tutto"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  CookieBanner as default
};
