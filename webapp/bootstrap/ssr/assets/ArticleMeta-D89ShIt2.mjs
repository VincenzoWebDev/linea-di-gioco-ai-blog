import { jsxs, jsx } from "react/jsx-runtime";
import { b as formatPublishedAt } from "./geopoliticalSeverity-B4PJR-9p.mjs";
function ArticleMeta({ topic, publishedAt }) {
  const dateLabel = publishedAt ? formatPublishedAt(publishedAt) : null;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#6B7280]", children: [
    topic && /* @__PURE__ */ jsx("span", { children: topic }),
    topic && dateLabel && /* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-[#1C2333]" }),
    dateLabel && /* @__PURE__ */ jsx("span", { children: dateLabel })
  ] });
}
export {
  ArticleMeta as A
};
