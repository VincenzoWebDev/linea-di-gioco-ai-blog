import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
function BlogFooter() {
  return /* @__PURE__ */ jsx("footer", { className: "border-t border-[#1C2333]", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto z-10 relative flex max-w-6xl flex-col gap-8 px-6 py-10 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "font-serif text-base text-[#E5E7EB]", children: "Linea di gioco" }),
      /* @__PURE__ */ jsx("div", { children: "Osservatorio geopolitico e strategico." }),
      /* @__PURE__ */ jsx("div", { className: "max-w-md text-xs leading-relaxed text-[#4B5563]", children: "Le notizie riportate sono rielaborazioni e sintesi basate su fonti pubbliche e testate giornalistiche esterne." }),
      /* @__PURE__ */ jsxs("div", { className: "pt-2 text-xs text-[#4B5563]", children: [
        "Â© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Linea di Gioco. Tutti i diritti riservati."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em]", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("home"),
          className: "transition hover:text-[#E5E7EB]",
          children: "Home"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("blog.articles.index"),
          className: "transition hover:text-[#E5E7EB]",
          children: "Articoli"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("contact"),
          className: "transition hover:text-[#E5E7EB]",
          children: "Contatti"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("newsletter"),
          className: "transition hover:text-[#E5E7EB]",
          children: "Newsletter"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("privacy-policy"),
          className: "transition hover:text-[#E5E7EB]",
          children: "Privacy"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("cookie-policy"),
          className: "transition hover:text-[#E5E7EB]",
          children: "Cookie"
        }
      )
    ] })
  ] }) });
}
export {
  BlogFooter as default
};
