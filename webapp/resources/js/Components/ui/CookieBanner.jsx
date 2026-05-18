import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@inertiajs/react";

export default function CookieBanner() {
    const [open, setOpen] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        const saved = JSON.parse(
            localStorage.getItem("cookie_consent") || "null",
        );

        if (!saved) {
            setOpen(true);
        } else {
            setAnalytics(saved.analytics);
            setMarketing(saved.marketing);
        }
    }, []);

    function getAnonId() {
        let id = localStorage.getItem("anon_id");

        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("anon_id", id);
        }

        return id;
    }

    const save = async (data) => {
        localStorage.setItem(
            "cookie_consent",
            JSON.stringify({
                ...data,
                timestamp: Date.now(),
            }),
        );

        await fetch(route("cookie-consent"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
            },
            body: JSON.stringify({
                ...data,
                anon_id: getAnonId(),
            }),
        });

        window.dispatchEvent(new Event("cookie-consent-updated"));

        setOpen(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* banner */}
                    <motion.div
                        className="fixed inset-x-0 bottom-6 z-[9999] flex justify-center px-4"
                        initial={{ opacity: 0, y: 40, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* header */}
                            <div className="p-5 border-b border-zinc-800">
                                <h2 className="text-lg font-semibold text-zinc-100">
                                    Cookie & Privacy
                                </h2>

                                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                                    Utilizziamo cookie tecnici e opzionali per
                                    migliorare la lettura delle notizie e
                                    analizzare il traffico.
                                </p>

                                {/* policy links */}
                                <div className="flex gap-4 mt-3 text-xs">
                                    <Link
                                        href={route("privacy-policy")}
                                        className="text-zinc-400 hover:text-zinc-200 underline"
                                    >
                                        Privacy Policy
                                    </Link>

                                    <Link
                                        href={route("cookie-policy")}
                                        className="text-zinc-400 hover:text-zinc-200 underline"
                                    >
                                        Cookie Policy
                                    </Link>
                                </div>
                            </div>

                            {/* options */}
                            <div className="p-5 space-y-3">
                                {/* necessary */}
                                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">
                                            Necessari
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Sempre attivi per il funzionamento
                                            del sito
                                        </p>
                                    </div>
                                    <span className="text-xs text-zinc-500">
                                        Sempre attivi
                                    </span>
                                </div>

                                {/* analytics */}
                                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">
                                            Analytics
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Ci aiutano a capire come vengono
                                            letti gli articoli
                                        </p>
                                    </div>

                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-zinc-300"
                                        checked={analytics}
                                        onChange={(e) =>
                                            setAnalytics(e.target.checked)
                                        }
                                    />
                                </div>

                                {/* marketing */}
                                <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/40 border border-zinc-800">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">
                                            Personalizzazione
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Contenuti consigliati in base alla
                                            lettura
                                        </p>
                                    </div>

                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-zinc-300"
                                        checked={marketing}
                                        onChange={(e) =>
                                            setMarketing(e.target.checked)
                                        }
                                    />
                                </div>
                            </div>

                            {/* actions */}
                            <div className="p-5 border-t border-zinc-800 flex flex-col sm:flex-row gap-2 sm:justify-end">
                                <button
                                    onClick={() =>
                                        save({
                                            necessary: true,
                                            analytics: false,
                                            marketing: false,
                                        })
                                    }
                                    className="px-4 py-2 text-sm rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-900 transition"
                                >
                                    Rifiuta
                                </button>

                                <button
                                    onClick={() =>
                                        save({
                                            necessary: true,
                                            analytics,
                                            marketing,
                                        })
                                    }
                                    className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition"
                                >
                                    Salva scelte
                                </button>

                                <button
                                    onClick={() =>
                                        save({
                                            necessary: true,
                                            analytics: true,
                                            marketing: true,
                                        })
                                    }
                                    className="px-4 py-2 text-sm rounded-lg bg-white text-black hover:bg-zinc-200 transition font-medium"
                                >
                                    Accetta tutto
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
