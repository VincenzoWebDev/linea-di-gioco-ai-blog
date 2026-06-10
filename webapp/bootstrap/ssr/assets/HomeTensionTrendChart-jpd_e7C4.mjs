import { jsx, jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
function HomeTensionTrendChart({ points, theme }) {
  return /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: points, margin: { top: 10, right: 10, left: -25, bottom: 0 }, children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorTension", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: theme.color, stopOpacity: 0.15 }),
      /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: theme.color, stopOpacity: 0 })
    ] }) }),
    /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#384968", opacity: 0.4, vertical: false }),
    /* @__PURE__ */ jsx(
      XAxis,
      {
        dataKey: "name",
        axisLine: false,
        tickLine: false,
        tick: { fill: "#7E8796", fontSize: 10, fontFamily: "monospace" }
      }
    ),
    /* @__PURE__ */ jsx(
      YAxis,
      {
        domain: ["dataMin - 3", "dataMax + 3"],
        axisLine: false,
        tickLine: false,
        tick: { fill: "#7E8796", fontSize: 10, fontFamily: "monospace" }
      }
    ),
    /* @__PURE__ */ jsx(
      Tooltip,
      {
        content: ({ active, payload }) => {
          if (active && payload && payload.length) {
            return /* @__PURE__ */ jsxs("div", { className: "border border-[#202A3D] bg-[#0B0F15] p-2 font-mono text-[10px] text-[#E8EDF5]", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[#7E8796] mb-0.5", children: [
                "DATA: ",
                payload[0].payload.date
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "font-semibold uppercase tracking-wider text-[#D7B56D]", children: [
                "ITG: ",
                payload[0].value,
                " / 100"
              ] })
            ] });
          }
          return null;
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Area,
      {
        type: "monotone",
        dataKey: "Tensione",
        stroke: theme.color,
        strokeWidth: 1.5,
        fillOpacity: 1,
        fill: "url(#colorTension)"
      }
    )
  ] }) });
}
export {
  HomeTensionTrendChart as default
};
