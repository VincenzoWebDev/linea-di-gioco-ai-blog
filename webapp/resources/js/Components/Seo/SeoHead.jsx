import { Head, usePage } from "@inertiajs/react";

function trimText(value, maxLength) {
    if (!value) {
        return "";
    }

    const normalized = String(value).replace(/\s+/g, " ").trim();

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function normalizeKeywords(keywords) {
    if (!Array.isArray(keywords)) {
        return [];
    }

    return [...new Set(
        keywords
            .map((value) => String(value || "").trim())
            .filter(Boolean),
    )];
}

function toAbsoluteUrl(value, baseUrl) {
    if (!value) {
        return "";
    }

    try {
        return new URL(value, baseUrl).toString();
    } catch {
        return value;
    }
}

export default function SeoHead({
    title,
    description,
    canonicalUrl,
    image,
    type,
    keywords = [],
    robots,
    structuredData = [],
    publishedTime,
    modifiedTime,
    section,
    author,
}) {
    const { props, url } = usePage();
    const seo = props.seo || {};
    const siteName = seo.siteName || "Linea di gioco";
    const baseUrl = seo.baseUrl || "http://127.0.0.1:8000";
    const resolvedTitle = trimText(title || seo.defaultTitle || siteName, 60);
    const resolvedDescription = trimText(
        description || seo.defaultDescription || "",
        160,
    );
    const resolvedType = type || seo.defaultType || "website";
    const resolvedKeywords = normalizeKeywords(keywords);
    const resolvedRobots = robots || "index,follow";
    const resolvedCanonical = toAbsoluteUrl(canonicalUrl || url, baseUrl);
    const resolvedImage = image ? toAbsoluteUrl(image, baseUrl) : "";
    const resolvedAuthor = author || siteName;
    const schemaList = Array.isArray(structuredData)
        ? structuredData.filter(Boolean)
        : [structuredData].filter(Boolean);
    const headProps = title ? { title: resolvedTitle } : {};

    return (
        <Head {...headProps}>
            <meta head-key="description" name="description" content={resolvedDescription} />
            <meta head-key="robots" name="robots" content={resolvedRobots} />
            <meta head-key="author" name="author" content={resolvedAuthor} />
            <meta head-key="og:type" property="og:type" content={resolvedType} />
            <meta head-key="og:title" property="og:title" content={resolvedTitle} />
            <meta head-key="og:description" property="og:description" content={resolvedDescription} />
            <meta head-key="og:url" property="og:url" content={resolvedCanonical} />
            <meta head-key="og:site_name" property="og:site_name" content={siteName} />
            <meta head-key="og:locale" property="og:locale" content={seo.defaultLocale || "it_IT"} />
            <meta head-key="twitter:card" name="twitter:card" content={resolvedImage ? (seo.twitterCard || "summary_large_image") : "summary"} />
            <meta head-key="twitter:title" name="twitter:title" content={resolvedTitle} />
            <meta head-key="twitter:description" name="twitter:description" content={resolvedDescription} />
            <link head-key="canonical" rel="canonical" href={resolvedCanonical} />

            {resolvedKeywords.length > 0 && (
                <meta
                    head-key="keywords"
                    name="keywords"
                    content={resolvedKeywords.join(", ")}
                />
            )}

            {resolvedImage && (
                <>
                    <meta head-key="og:image" property="og:image" content={resolvedImage} />
                    <meta head-key="twitter:image" name="twitter:image" content={resolvedImage} />
                </>
            )}

            {publishedTime && (
                <meta
                    head-key="article:published_time"
                    property="article:published_time"
                    content={publishedTime}
                />
            )}

            {modifiedTime && (
                <meta
                    head-key="article:modified_time"
                    property="article:modified_time"
                    content={modifiedTime}
                />
            )}

            {section && (
                <meta head-key="article:section" property="article:section" content={section} />
            )}

            {schemaList.map((item, index) => (
                <script
                    key={`schema-${index}`}
                    head-key={`schema-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(item),
                    }}
                />
            ))}
        </Head>
    );
}
