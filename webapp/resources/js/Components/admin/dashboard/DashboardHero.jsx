export default function DashboardHero({ overview = {} }) {
    return (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-10 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Overview</p>
            <h3 className="mt-2 text-3xl font-semibold">
                {overview.headline || "Contenuti e pipeline sotto controllo."}
            </h3>
            <p className="mt-3 max-w-3xl text-sm text-slate-300">
                {overview.subheadline ||
                    "Monitoraggio reale del sistema editoriale e della pipeline AI."}
            </p>
        </div>
    );
}
