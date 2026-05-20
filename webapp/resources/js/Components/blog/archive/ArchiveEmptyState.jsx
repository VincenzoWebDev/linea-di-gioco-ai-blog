export default function ArchiveEmptyState() {
    return (
        <div className="border border-dashed border-[#2A354D] bg-[#101620] p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#7E8796]">
                Archivio vuoto
            </p>
            <p className="mt-3 text-sm text-[#9CA3AF]">
                Non ci sono ancora dossier pubblicati. Torna presto per nuove
                analisi.
            </p>
        </div>
    );
}
