import {
    Arrow as TooltipArrow,
    Content as TooltipContent,
    Portal as TooltipPortal,
    Root as TooltipRoot,
    Trigger as TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { safeText } from "@/lib/blog/text";

function TooltipPanel({ term, entry }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="z-50 max-w-xs border border-[#D7B56D]/40 bg-[#0B0F15]/95 px-4 py-3 font-mono text-sm text-[#D7DEE8] shadow-2xl shadow-black/40 backdrop-blur"
        >
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
        </motion.div>
    );
}

export default function GlossaryTooltip({ term, entry }) {
    const [isMounted, setIsMounted] = useState(false);
    const [usePopover, setUsePopover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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

    const trigger = (
        <button
            type="button"
            onClick={() => {
                if (usePopover) {
                    setIsOpen((current) => !current);
                }
            }}
            className={triggerClassName}
        >
            <span>{term}</span>
            <Info className="h-3 w-3 translate-y-[1px] opacity-70 transition group-hover:opacity-100" />
        </button>
    );

    if (usePopover) {
        return (
            <>
                {trigger}
                {isOpen && (
                    <>
                        <button
                            type="button"
                            aria-label={`Chiudi dettaglio ${safeText(term)}`}
                            className="fixed inset-0 z-40 bg-black/30"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="fixed inset-x-4 bottom-4 z-50">
                            <div className="relative border border-[#D7B56D]/40 bg-[#0B0F15]/95 px-4 py-3 font-mono text-sm text-[#D7DEE8] shadow-2xl shadow-black/40 backdrop-blur">
                                <button
                                    type="button"
                                    aria-label={`Chiudi dettaglio ${safeText(term)}`}
                                    className="absolute right-3 top-3 text-xs uppercase tracking-[0.2em] text-[#8FA0B6]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Chiudi
                                </button>
                                <TooltipPanel term={term} entry={entry} />
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }

    return (
        <TooltipRoot delayDuration={120}>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipPortal>
                <TooltipContent
                    side="top"
                    align="center"
                    sideOffset={10}
                    collisionPadding={16}
                    className="z-50"
                >
                    <div className="relative">
                        <TooltipPanel term={term} entry={entry} />
                        <TooltipArrow className="fill-[#D7B56D]/40" />
                    </div>
                </TooltipContent>
            </TooltipPortal>
        </TooltipRoot>
    );
}
