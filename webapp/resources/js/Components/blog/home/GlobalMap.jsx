import {
    ComposableMap,
    Geographies,
    Geography,
    Graticule,
    Marker,
} from "react-simple-maps";
import { useState } from "react";
import { severityClasses } from "@/lib/geopoliticalSeverity";
import { ArrowRight, Clock3, Crosshair, MapPin, RadioTower, Satellite } from "lucide-react";
import { Link } from "@inertiajs/react";
import ArticleCoverImage from "@/Components/blog/articles/ArticleCoverImage";
import geoUrl from "@/assets/world-atlas/countries-110m.json?url";

function formatCoordinate(value, axis) {
    const numeric = Number(value) || 0;
    const direction =
        axis === "lat" ? (numeric >= 0 ? "N" : "S") : numeric >= 0 ? "E" : "W";

    return `${Math.abs(numeric).toFixed(2)} ${direction}`;
}

export default function GlobalMap({ operations }) {
    const [activeId, setActiveId] = useState(operations[0]?.id || null);
    const active =
        operations.find((item) => item.id === activeId) || operations[0];

    return (
        <section className="relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="relative grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:p-7">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]">
                                Scenario globale
                            </p>
                            <h1 className="mt-3 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-6xl">
                                Centro di comando
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]">
                            <Satellite className="h-4 w-4 text-[#D7B56D]" />
                            Monitoraggio geopolitico attivo
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-7 aspect-[1.55] sm:aspect-[1.72] w-full max-w-full overflow-hidden border border-[#182234] bg-[#0B0F15]/80 [&_svg]:max-w-full [&_svg]:origin-center [&_svg]:scale-[1.02] sm:[&_svg]:scale-[1.1]">
                        <ComposableMap
                            projectionConfig={{
                                rotate: [-10, 0, 0],
                                scale: 178,
                            }}
                            className="h-full w-full"
                        >
                            <Graticule stroke="#233047" strokeWidth={0.35} />
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#111827"
                                            stroke="#263248"
                                            strokeWidth={0.42}
                                            style={{
                                                default: { outline: "none" },
                                                hover: {
                                                    fill: "#162238",
                                                    outline: "none",
                                                },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    ))
                                }
                            </Geographies>

                            {operations
                                .filter(
                                    (item) =>
                                        Number.isFinite(Number(item.lat)) &&
                                        Number.isFinite(Number(item.long)),
                                )
                                .map((item) => {
                                const severity =
                                    severityClasses[item.severity] ||
                                    severityClasses.low;

                                return (
                                    <Marker
                                        key={`${item.id}-${item.region_key || item.region_name}`}
                                        coordinates={[
                                            Number(item.long),
                                            Number(item.lat),
                                        ]}
                                        onMouseEnter={() =>
                                            setActiveId(item.id)
                                        }
                                        onFocus={() => setActiveId(item.id)}
                                    >
                                        <g className="map-marker-pulse cursor-pointer">
                                            <circle
                                                r={12}
                                                fill={severity.marker}
                                                fillOpacity={0.16}
                                            />
                                            <circle
                                                r={5.5}
                                                fill={severity.marker}
                                                fillOpacity={0.34}
                                            />
                                            <circle
                                                r={2.6}
                                                fill={severity.marker}
                                            />
                                        </g>
                                    </Marker>
                                );
                            })}
                        </ComposableMap>
                    </div>
                </div>

                <aside className="min-w-0 border border-[#202A3D] bg-[#101620]/95 p-4 sm:p-5 lg:min-h-[620px]">
                    {active ? (
                        <div className="flex h-full flex-col">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7E8796]">
                                        Hotspot selezionato
                                    </p>
                                    <h2 className="mt-2 min-h-[4rem] text-2xl font-semibold leading-tight text-[#F3F4F6]">
                                        {active.display_region_name || active.region_name}
                                    </h2>
                                </div>
                                <span
                                    className={`mt-0.5 shrink-0 whitespace-nowrap border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${(severityClasses[active.severity] ?? severityClasses.low).border} ${(severityClasses[active.severity] ?? severityClasses.low).bg} ${(severityClasses[active.severity] ?? severityClasses.low).text}`}
                                >
                                    {(severityClasses[active.severity] ?? severityClasses.low).label}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <SignalBox
                                    icon={Crosshair}
                                    label="Tensione"
                                    value={active.current_tension}
                                />
                                <SignalBox
                                    icon={MapPin}
                                    label="Coordinate"
                                    value={`${formatCoordinate(active.lat, "lat")} / ${formatCoordinate(active.long, "long")}`}
                                />
                                <SignalBox
                                    icon={Clock3}
                                    label="Silenzio"
                                    value={`${active.silence_hours}h`}
                                />
                                <SignalBox
                                    icon={RadioTower}
                                    label="Stato"
                                    value={active.radio_silence_label}
                                />
                            </div>

                            <ArticleCoverImage
                                item={active}
                                variant="thumb"
                                className="mt-5 h-40 shrink-0 border border-[#202A3D]"
                                loading="eager"
                                fetchPriority="high"
                                sizes="(min-width: 1024px) 320px, 100vw"
                            />

                            <p className="mt-5 min-h-[5.25rem] line-clamp-3 font-mono text-sm leading-7 text-[#B8C2D2]">
                                {active.title}
                            </p>

                            {active.url && (
                                <Link
                                    href={active.url}
                                    className="mt-auto inline-flex w-full items-center justify-center gap-2 border border-[#D7B56D]/40 bg-[#D7B56D]/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-[#FDE68A] transition hover:border-[#D7B56D]/70 hover:bg-[#D7B56D]/15"
                                >
                                    Apri dossier
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="flex min-h-80 items-center justify-center text-center font-mono text-sm uppercase tracking-[0.24em] text-[#7E8796]">
                            Nessun hotspot attivo
                        </div>
                    )}
                </aside>
            </div>
        </section>
    );
}

function SignalBox({ icon: Icon, label, value }) {
    return (
        <div className="border border-[#202A3D] bg-[#0B0F15] p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7E8796]">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <div className="mt-2 truncate font-mono text-sm text-[#E8EDF5]">
                {value}
            </div>
        </div>
    );
}
