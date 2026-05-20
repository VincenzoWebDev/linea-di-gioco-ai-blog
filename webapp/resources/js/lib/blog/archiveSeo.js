export function buildArchiveSeo(page, canonicalUrl) {
    const description =
        "Archivio completo dei dossier di Linea di gioco: analisi geopolitiche su crisi, sicurezza, energia, conflitti e scenari internazionali.";

    return {
        title:
            page > 1
                ? `Archivio dossier pagina ${page}`
                : "Archivio dossier geopolitici",
        description,
        canonicalUrl,
        keywords: [
            "archivio geopolitica",
            "dossier geopolitici",
            "analisi internazionali",
            "sicurezza internazionale",
            "conflitti globali",
        ],
        structuredData: [
            {
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: "Archivio dossier di Linea di gioco",
                url: canonicalUrl,
                inLanguage: "it-IT",
                description,
            },
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "Home",
                        item: route("home"),
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: "Archivio dossier",
                        item: canonicalUrl,
                    },
                ],
            },
        ],
    };
}
