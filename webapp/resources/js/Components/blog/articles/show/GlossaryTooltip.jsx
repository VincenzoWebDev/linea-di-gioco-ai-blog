import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { safeText } from "@/lib/blog/text";

function TooltipPanel({ term, entry }) {
    return (
        <div className="z-50 max-w-xs border border-[#D7B56D]/40 bg-[#0B0F15]/95 px-4 py-3 font-mono text-sm text-[#D7DEE8] shadow-2xl shadow-black/40 backdrop-blur">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#D7B56D]">
                {safeText(term)}
            </div>
            <p className="mt-2 leading-6">{safeText(entry?.definition)}</p>
            {entry?.importance && (
                <div className="mt-3 border-t border-[#202A3D] pt-2 text-[11px] uppercase tracking-[0.2em] text-[#8FA0B6]">
                    Importanza:{" "}
                    <span className="text-[#F3F4F6]">
                        {safeText(entry.importance)}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function GlossaryTooltip({ term, entry }) {
    const [isMounted, setIsMounted] = useState(false);
    const [usePopover, setUsePopover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);

        if (
            typeof window === "undefined" ||
            typeof window.matchMedia !== "function"
        ) {
            return undefined;
        }

        const mediaQuery = window.matchMedia(
            "(max-width: 767px), (pointer: coarse)",
        );
        const syncMode = () => setUsePopover(mediaQuery.matches);

        syncMode();

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", syncMode);

            return () => mediaQuery.removeEventListener("change", syncMode);
        }

        mediaQuery.addListener(syncMode);

        return () => mediaQuery.removeListener(syncMode);
    }, []);

    useEffect(() => {
        if (!isMounted || !isOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [isMounted, isOpen]);

    const triggerClassName =
        "group inline-flex cursor-help items-baseline gap-1 border-b border-dotted border-[#D7B56D]/80 text-left text-[#F3F4F6] decoration-transparent transition hover:text-[#FDE68A]";

    if (!isMounted) {
        return (
            <span className={triggerClassName}>
                <span>{term}</span>
                <Info
                    className="h-3 w-3 translate-y-[1px] opacity-70"
                    aria-hidden="true"
                />
            </span>
        );
    }

    return (
        <span
            ref={wrapperRef}
            className="relative inline-flex"
            onMouseEnter={() => {
                if (!usePopover) {
                    setIsOpen(true);
                }
            }}
            onMouseLeave={() => {
                if (!usePopover) {
                    setIsOpen(false);
                }
            }}
        >
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className={triggerClassName}
            >
                <span>{term}</span>
                <Info className="h-3 w-3 translate-y-[1px] opacity-70 transition group-hover:opacity-100" />
            </button>

            {isOpen && (
                <span
                    className={
                        usePopover
                            ? "fixed inset-x-4 bottom-4 z-50"
                            : "absolute left-1/2 top-full z-50 mt-3 w-max max-w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2"
                    }
                >
                    <span className="block relative">
                        <TooltipPanel term={term} entry={entry} />
                    </span>
                </span>
            )}
        </span>
    );
}
