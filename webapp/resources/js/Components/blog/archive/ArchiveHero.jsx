import { Link } from "@inertiajs/react";
import { ArrowLeft, FileSearch } from "lucide-react";

export default function ArchiveHero({ total }) {
    return (
        <section className="relative overflow-hidden border border-[#202A3D] bg-[#080B10] shadow-[0_32px_90px_rgba(0,0,0,0.32)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(215,181,109,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(215,181,109,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

            <div className="relative p-4 sm:p-5 lg:p-8">
                <Link
                    href={route("home")}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9CA3AF] transition hover:text-[#D7B56D]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Sala operativa
                </Link>

                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.34em] text-[#7E8796]">
                            Archivio analisi
                        </p>
                        <h1 className="mt-3 font-serif text-3xl leading-tight text-[#F3F4F6] sm:text-4xl md:text-5xl">
                            File declassificati
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#AAB3C2]">
                            Tutti i dossier geopolitici pubblicati: analisi su
                            crisi, sicurezza, energia ed equilibri
                            internazionali.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 border border-[#2A354D] bg-[#101620]/90 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#AAB3C2]">
                        <FileSearch className="h-4 w-4 text-[#D7B56D]" />
                        {total} dossier
                    </div>
                </div>
            </div>
        </section>
    );
}
