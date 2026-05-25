import { jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
function AdminPagination({ links = [] }) {
  if (links.length <= 3) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: links.map((link, idx) => {
    const label = link.label.replace("&laquo;", "«").replace("&raquo;", "»");
    if (!link.url) {
      return /* @__PURE__ */ jsx(
        "span",
        {
          className: "rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-400",
          children: label
        },
        `${idx}-${label}`
      );
    }
    return /* @__PURE__ */ jsx(
      Link,
      {
        href: link.url,
        preserveScroll: true,
        preserveState: true,
        className: `rounded-md border px-3 py-1 text-sm ${link.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`,
        children: label
      },
      `${idx}-${label}`
    );
  }) });
}
export {
  AdminPagination as A
};
