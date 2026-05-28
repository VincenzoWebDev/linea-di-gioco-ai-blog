const HOME_DESCRIPTION =
    "Analisi geopolitiche, dossier internazionali e briefing AI su crisi, sicurezza, energia e hotspot globali monitorati in tempo reale.";

export function buildHomeSeo(canonicalUrl) {
    const organizationName = "Linea di gioco";

    return {
        title: "Analisi geopolitiche e dossier internazionali",
        description: HOME_DESCRIPTION,
        canonicalUrl,
        keywords: [
            "geopolitica",
            "analisi geopolitica",
            "dossier internazionali",
            "crisi internazionali",
            "intelligence open source",
        ],
        structuredData: [
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: organizationName,
                url: canonicalUrl,
                inLanguage: "it-IT",
                description: HOME_DESCRIPTION,
            },
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: organizationName,
                url: canonicalUrl,
                logo: {
                    "@type": "ImageObject",
                    "url": `${canonicalUrl.replace(/\/$/, "")}/images/logo-schema.png`,
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: "Analisi geopolitiche e dossier internazionali",
                url: canonicalUrl,
                inLanguage: "it-IT",
                description: HOME_DESCRIPTION,
                isPartOf: {
                    "@type": "WebSite",
                    name: organizationName,
                    url: canonicalUrl,
                },
            },
        ],
    };
}
