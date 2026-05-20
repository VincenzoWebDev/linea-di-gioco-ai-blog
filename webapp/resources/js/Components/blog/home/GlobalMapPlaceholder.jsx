export default function GlobalMapPlaceholder() {
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
                        <div className="h-12 w-40 animate-pulse border border-[#2A354D] bg-[#101620]/90" />
                    </div>
                    <div
                        className="mt-5 sm:mt-7 aspect-[1.55] sm:aspect-[1.72] w-full max-w-full animate-pulse border border-[#182234] bg-[#0B0F15]/80"
                        aria-hidden
                    />
                </div>
                <aside className="min-w-0 border border-[#202A3D] bg-[#101620]/95 p-4 sm:p-5">
                    <div className="h-6 w-32 animate-pulse bg-[#182234]" />
                    <div className="mt-3 h-8 w-48 animate-pulse bg-[#182234]" />
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="h-16 animate-pulse border border-[#202A3D] bg-[#0B0F15]" />
                        <div className="h-16 animate-pulse border border-[#202A3D] bg-[#0B0F15]" />
                    </div>
                    <div className="mt-5 h-40 animate-pulse border border-[#202A3D] bg-[#0B0F15]" />
                </aside>
            </div>
        </section>
    );
}
