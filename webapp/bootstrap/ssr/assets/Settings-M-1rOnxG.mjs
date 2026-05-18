import { jsxs, jsx } from "react/jsx-runtime";
import { A as Authenticated } from "./AuthenticatedLayout-DuqH5o4I.mjs";
import { Head } from "@inertiajs/react";
import { C as Card, c as CardHeader, d as CardTitle, b as CardDescription, a as CardContent } from "./card-DRB3Bbat.mjs";
import "react";
import "./ApplicationLogo-VXSMMN2A.mjs";
import "@headlessui/react";
import "lucide-react";
import "./SeoHead-Bfgu-MHE.mjs";
function Settings({ auth }) {
  return /* @__PURE__ */ jsxs(
    Authenticated,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Impostazioni" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Impostazioni" }),
        /* @__PURE__ */ jsx("div", { className: "py-10", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Impostazioni blog" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Qui aggiungeremo configurazioni, SEO e branding." })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-600", children: "Layout di base pronto." }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Settings as default
};
