import { jsx, jsxs } from "react/jsx-runtime";
import { RadioTower } from "lucide-react";
import Marquee from "react-fast-marquee";
function formatCoordinate(value, axis) {
  const numeric = Number(value) || 0;
  const direction = axis === "lat" ? numeric >= 0 ? "N" : "S" : numeric >= 0 ? "E" : "W";
  return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}
function TacticalTicker({ items }) {
  if (items.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx("section", { className: "mt-6 overflow-hidden border-y border-[#202A3D] bg-[#0B0F15] py-3", children: /* @__PURE__ */ jsx(Marquee, { gradient: false, speed: 28, pauseOnHover: true, children: items.map((item) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "mx-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-[#9CA3AF]",
      children: [
        /* @__PURE__ */ jsx(RadioTower, { className: "h-4 w-4 text-[#D7B56D]" }),
        /* @__PURE__ */ jsx("span", { className: "text-[#D7B56D]", children: item.operation_code }),
        /* @__PURE__ */ jsxs("span", { children: [
          formatCoordinate(item.lat, "lat"),
          " /",
          " ",
          formatCoordinate(item.long, "long")
        ] }),
        /* @__PURE__ */ jsx("span", { className: "max-w-[420px] truncate text-[#E8EDF5]", children: item.title })
      ]
    },
    `${item.id}-${item.title}`
  )) }) });
}
export {
  TacticalTicker as default
};
