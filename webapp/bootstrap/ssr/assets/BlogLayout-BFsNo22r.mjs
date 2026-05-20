import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, Suspense, lazy } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Minus, TrendingDown, TrendingUp, X, Menu } from "lucide-react";
const trendIcon = {
  rising: TrendingUp,
  falling: TrendingDown,
  stable: Minus
};
function riskColor(score) {
  if (score >= 80) {
    return "text-red-600";
  }
  if (score >= 60) {
    return "text-orange-600";
  }
  if (score >= 40) {
    return "text-yellow-600";
  }
  return "text-green-600";
}
function TensionItem({ tension }) {
  const Trend = trendIcon[tension.trend_direction] ?? Minus;
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "max-w-32 truncate text-[#E5E7EB]", children: tension.region_name }),
    /* @__PURE__ */ jsx(Trend, { className: "h-3.5 w-3.5 text-[#9CA3AF]", "aria-hidden": "true" }),
    /* @__PURE__ */ jsx("span", { className: riskColor(tension.risk_score), children: tension.risk_score })
  ] });
  const className = "flex h-8 shrink-0 items-center gap-2 rounded-md border border-[#1C2333] bg-[#0E1116] px-3";
  if (tension.article_url) {
    return /* @__PURE__ */ jsx(
      Link,
      {
        href: tension.article_url,
        title: tension.status_label,
        className: `${className} transition hover:border-[#2C4667]`,
        children: content
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { title: tension.status_label, className, children: content });
}
function TensionHeader({ tensions = [] }) {
  const visibleTensions = tensions.slice(0, 5);
  if (visibleTensions.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "border-t border-[#1C2333] bg-[#111722]/95",
      "aria-label": "Top tensioni geopolitiche",
      children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3 text-xs sm:px-6", children: [
        /* @__PURE__ */ jsx("span", { className: "shrink-0 uppercase tracking-[0.22em] text-[#6B7280]", children: "Tensioni" }),
        /* @__PURE__ */ jsx("div", { className: "flex min-w-0 gap-2", children: visibleTensions.map((tension) => /* @__PURE__ */ jsx(
          TensionItem,
          {
            tension
          },
          tension.region_name
        )) })
      ] })
    }
  );
}
const logo = "/build/assets/linea-di-gioco-logo-CWRVHu89.webp";
function BlogHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const page = usePage();
  const { geopoliticalTensions = [] } = page.props;
  const currentPath = normalizePath(page.url);
  const isHomeActive = currentPath === "/";
  const isArticlesActive = currentPath === "/articoli" || currentPath.startsWith("/articoli/");
  const menuItems = [
    {
      label: "Home",
      href: route("home"),
      active: isHomeActive
    },
    {
      label: "Articoli",
      href: route("blog.articles.index"),
      active: isArticlesActive
    }
  ];
  return /* @__PURE__ */ jsxs("header", { className: "border-b border-[#1C2333] relative z-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/",
          className: "flex min-w-0 items-center gap-2 sm:gap-3",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: logo,
                alt: "Logo Linea di gioco",
                className: "block h-14 w-14 object-contain",
                width: 56,
                height: 56,
                decoding: "async"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-serif text-lg", children: "Linea di gioco" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-[0.3em] text-[#6B7280]", children: "Geopolitica" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("nav", { className: "hidden items-center gap-6 text-sm text-[#9CA3AF] md:flex", children: menuItems.map((item) => /* @__PURE__ */ jsx(
        Link,
        {
          href: item.href,
          className: `transition ${item.active ? "text-[#E5E7EB]" : "text-[#9CA3AF] hover:text-[#E5E7EB]"}`,
          children: item.label
        },
        item.label
      )) }),
      /* @__PURE__ */ jsx("div", { className: "hidden items-center gap-3 md:flex", children: /* @__PURE__ */ jsx(
        Link,
        {
          href: route("newsletter"),
          className: "rounded-full border border-[#1C2333] px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#9CA3AF] transition hover:border-[#1F3A5F] hover:text-[#E5E7EB]",
          children: "Newsletter"
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setIsOpen((prev) => !prev),
          className: "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1C2333] bg-[#131823] text-[#9CA3AF] transition hover:text-[#E5E7EB] md:hidden",
          "aria-label": "Apri menu",
          children: isOpen ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(TensionHeader, { tensions: geopoliticalTensions }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `border-t border-[#1C2333] bg-[#131823] px-6 py-4 md:hidden ${isOpen ? "block" : "hidden"}`,
        children: [
          /* @__PURE__ */ jsx("nav", { className: "flex flex-col gap-3", children: menuItems.map((item) => /* @__PURE__ */ jsx(
            Link,
            {
              href: item.href,
              onClick: () => setIsOpen(false),
              className: `rounded-md px-3 py-2 text-sm transition ${item.active ? "bg-[#1C2333] text-[#E5E7EB]" : "text-[#9CA3AF] hover:bg-[#171E2B] hover:text-[#E5E7EB]"}`,
              children: item.label
            },
            `mobile-${item.label}`
          )) }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("newsletter"),
              onClick: () => setIsOpen(false),
              className: "mt-4 block w-full rounded-full border border-[#1C2333] px-4 py-2 text-center text-xs uppercase tracking-[0.25em] text-[#9CA3AF] transition hover:border-[#1F3A5F] hover:text-[#E5E7EB]",
              children: "Newsletter"
            }
          )
        ]
      }
    )
  ] });
}
function normalizePath(url) {
  if (typeof url !== "string" || url.trim() === "") {
    return "/";
  }
  const [path] = url.split("?");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}
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
function getConsent() {
  const raw = document.cookie.split("; ").find((row) => row.startsWith("cookie_consent="));
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw.split("=")[1]));
  } catch {
    return null;
  }
}
function hasAnalyticsConsent() {
  const consent = getConsent();
  return consent?.analytics === true;
}
let gaLoaded = false;
function loadGA() {
  if (gaLoaded) return;
  gaLoaded = true;
  const script = document.createElement("script");
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-KQWY6P94WJ";
  script.async = true;
  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", /* @__PURE__ */ new Date());
    gtag("config", "G-KQWY6P94WJ");
  };
  document.head.appendChild(script);
}
function useAnalytics() {
  useEffect(() => {
    if (hasAnalyticsConsent()) {
      loadGA();
    }
  }, []);
}
const CookieBanner = lazy(() => import("./CookieBanner-CMSI6aoR.mjs"));
function BlogLayout({ children }) {
  const { auth } = usePage().props;
  useAnalytics();
  useEffect(() => {
    const handler = () => {
      const saved = JSON.parse(
        localStorage.getItem("cookie_consent") || "null"
      );
      if (saved?.analytics) {
        loadGA();
      }
    };
    window.addEventListener("cookie-consent-updated", handler);
    return () => window.removeEventListener("cookie-consent-updated", handler);
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen overflow-hidden bg-[#0E1116] text-[#E5E7EB] font-sans", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute z-0 -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[#1F3A5F]/40 blur-[120px]" }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute z-0 -bottom-48 left-10 h-[420px] w-[420px] rounded-full bg-[#9E2A2B]/30 blur-[140px]" }),
    /* @__PURE__ */ jsx(BlogHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto w-full max-w-6xl px-4 pb-16 pt-8 text-base leading-[1.7] sm:px-6 sm:pb-20 sm:pt-12 sm:text-[17px]", children: [
      children,
      auth?.isLogged ? null : /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(CookieBanner, {}) })
    ] }),
    /* @__PURE__ */ jsx(BlogFooter, {})
  ] }) });
}
export {
  BlogLayout as B
};
