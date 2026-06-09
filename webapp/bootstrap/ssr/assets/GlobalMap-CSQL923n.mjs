import { jsxs, jsx } from "react/jsx-runtime";
import { ComposableMap, Graticule, Geographies, Geography, Marker } from "react-simple-maps";
import { useState } from "react";
import { d as severityClasses } from "./geopoliticalSeverity-B4PJR-9p.mjs";
import { Satellite, Crosshair, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { A as ArticleCoverImage } from "./ArticleIntelligenceCard-6E8fd8fc.mjs";
import { t as trendCopy } from "./trendCopy-BRLsGmW-.mjs";
const geoUrl = "/build/assets/countries-110m-B3KlhDC_.json";
function formatCoordinate(value, axis) {
  const numeric = Number(value) || 0;
  const direction = axis === "lat" ? numeric >= 0 ? "N" : "S" : numeric >= 0 ? "E" : "W";
  return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}
function GlobalMap({ operations }) {
  const [activeId, setActiveId] = useState(operations[0]?.id || null);
  const active = operations.find((item) => item.id === activeId) || operations[0];
  const trend = active ? trendCopy[active.trend_direction] || trendCopy.stable : null;
  const TrendIcon = trend?.icon;
  const trendLabel = trend?.label;
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" }),
    /* @__PURE__ */ jsxs("div", { className: "relative grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:p-7", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]", children: "Scenario globale" }),
            /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-6xl", children: "Centro di comando" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]", children: [
            /* @__PURE__ */ jsx(Satellite, { className: "h-4 w-4 text-[#D7B56D]" }),
            "Monitoraggio geopolitico attivo"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 sm:mt-7 aspect-[1.55] sm:aspect-[1.72] w-full max-w-full overflow-hidden border border-[#182234] bg-[#0B0F15]/80 [&_svg]:max-w-full [&_svg]:origin-center [&_svg]:scale-[1.02] sm:[&_svg]:scale-[1.1]", children: /* @__PURE__ */ jsxs(
          ComposableMap,
          {
            projectionConfig: {
              rotate: [-10, 0, 0],
              scale: 178
            },
            className: "h-full w-full",
            children: [
              /* @__PURE__ */ jsx(Graticule, { stroke: "#233047", strokeWidth: 0.35 }),
              /* @__PURE__ */ jsx(Geographies, { geography: geoUrl, children: ({ geographies }) => geographies.map((geo) => /* @__PURE__ */ jsx(
                Geography,
                {
                  geography: geo,
                  fill: "#111827",
                  stroke: "#263248",
                  strokeWidth: 0.42,
                  style: {
                    default: { outline: "none" },
                    hover: {
                      fill: "#162238",
                      outline: "none"
                    },
                    pressed: { outline: "none" }
                  }
                },
                geo.rsmKey
              )) }),
              operations.filter(
                (item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.long))
              ).map((item) => {
                const severity = severityClasses[item.severity] || severityClasses.low;
                return /* @__PURE__ */ jsx(
                  Marker,
                  {
                    coordinates: [
                      Number(item.long),
                      Number(item.lat)
                    ],
                    onMouseEnter: () => setActiveId(item.id),
                    onFocus: () => setActiveId(item.id),
                    children: /* @__PURE__ */ jsxs("g", { className: "map-marker-pulse cursor-pointer", children: [
                      /* @__PURE__ */ jsx(
                        "circle",
                        {
                          r: 12,
                          fill: severity.marker,
                          fillOpacity: 0.16
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "circle",
                        {
                          r: 5.5,
                          fill: severity.marker,
                          fillOpacity: 0.34
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "circle",
                        {
                          r: 2.6,
                          fill: severity.marker
                        }
                      )
                    ] })
                  },
                  `${item.id}-${item.region_key || item.region_name}`
                );
              })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("aside", { className: "min-w-0 border border-[#202A3D] bg-[#101620]/95 p-4 sm:p-5 lg:min-h-[620px]", children: active ? /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.26em] text-[#7E8796]", children: "Hotspot selezionato" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 min-h-[4rem] text-2xl font-semibold leading-tight text-[#F3F4F6]", children: active.display_region_name || active.region_name })
          ] }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `mt-0.5 shrink-0 whitespace-nowrap border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${(severityClasses[active.severity] ?? severityClasses.low).border} ${(severityClasses[active.severity] ?? severityClasses.low).bg} ${(severityClasses[active.severity] ?? severityClasses.low).text}`,
              children: (severityClasses[active.severity] ?? severityClasses.low).label
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(
            SignalBox,
            {
              icon: Crosshair,
              label: "Tensione",
              value: active.current_tension
            }
          ),
          /* @__PURE__ */ jsx(
            SignalBox,
            {
              icon: TrendIcon,
              label: "Tendenza",
              value: trendLabel
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(
            SignalBox,
            {
              icon: MapPin,
              label: "Coordinate",
              value: `${formatCoordinate(active.lat, "lat")} / ${formatCoordinate(active.long, "long")}`
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(
          ArticleCoverImage,
          {
            item: active,
            variant: "thumb",
            className: "mt-5 h-40 shrink-0 border border-[#202A3D]",
            loading: "eager",
            fetchPriority: "high",
            sizes: "(min-width: 1024px) 320px, 100vw"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-5 min-h-[5.25rem] line-clamp-3 font-mono text-sm leading-7 text-[#B8C2D2]", children: active.title }),
        active.url && /* @__PURE__ */ jsxs(
          Link,
          {
            href: active.url,
            className: "mt-auto inline-flex w-full items-center justify-center gap-2 border border-[#D7B56D]/40 bg-[#D7B56D]/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[#FDE68A] transition hover:border-[#D7B56D]/70 hover:bg-[#D7B56D]/15",
            children: [
              "Apri dossier",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex min-h-80 items-center justify-center text-center font-mono text-sm uppercase tracking-[0.24em] text-[#7E8796]", children: "Nessun hotspot attivo" }) })
    ] })
  ] });
}
function SignalBox({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "border border-[#202A3D] bg-[#0B0F15] p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7E8796]", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
      label
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 truncate font-mono text-sm text-[#E8EDF5]", children: value })
  ] });
}
export {
  GlobalMap as default
};
