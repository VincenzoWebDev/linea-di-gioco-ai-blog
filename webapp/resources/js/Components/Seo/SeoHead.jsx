import { Head, usePage } from "@inertiajs/react";

function safeText(value) {
    if (typeof value === "symbol") {
        return value.description || "";
    }

    if (value == null) {
        return "";
    }

    return String(value);
}

function trimText(value, maxLength) {
    if (!value) {
        return "";
    }

    const normalized = safeText(value).replace(/\s+/g, " ").trim();

    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function normalizeKeywords(keywords) {
    if (!Array.isArray(keywords)) {
        return [];
    }

    return [...new Set(
        keywords
            .map((value) => safeText(value).trim())
            .filter(Boolean),
    )];
}

function toAbsoluteUrl(value, baseUrl) {
    if (!value) {
        return "";
    }

    try {
        return new URL(safeText(value), safeText(baseUrl)).toString();
    } catch {
        return safeText(value);
    }
}

function safeJson(value) {
    try {
        return JSON.stringify(value, (_key, currentValue) => {
            if (typeof currentValue === "symbol") {
                return currentValue.description || "";
            }

            if (typeof currentValue === "bigint") {
                return String(currentValue);
            }

            return currentValue;
        });
    } catch {
        return "";
    }
}

export default function SeoHead({
    title,
    description,
    canonicalUrl,
    image,
    imageAlt,
    type,
    keywords = [],
    robots,
    structuredData = [],
    preloadImages = [],
    publishedTime,
    modifiedTime,
    section,
    author,
}) {
    const { props, url } = usePage();
    const seo = props.seo || {};
    const siteName = trimText(seo.siteName || "Linea di gioco", 80);
    const baseUrl = safeText(seo.baseUrl || "http://127.0.0.1:8000");
    const resolvedTitle = trimText(title || seo.defaultTitle || siteName, 60);
    const resolvedDescription = trimText(
        description || seo.defaultDescription || "",
        160,
    );
    const resolvedType = safeText(type || seo.defaultType || "website");
    const resolvedKeywords = normalizeKeywords(keywords);
    const resolvedRobots = safeText(
        robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    );
    const resolvedCanonical = toAbsoluteUrl(canonicalUrl || url, baseUrl);
    const resolvedImage = toAbsoluteUrl(image || seo.defaultImage || "", baseUrl);
    const resolvedImageAlt = trimText(
        imageAlt || seo.defaultImageAlt || resolvedTitle || siteName,
        160,
    );
    const resolvedAuthor = trimText(author || seo.defaultAuthor || siteName, 80);
    const resolvedLocale = safeText(seo.defaultLocale || "it_IT");
    const resolvedTwitterCard = safeText(
        resolvedImage ? (seo.twitterCard || "summary_large_image") : "summary",
    );
    const resolvedTwitterSite = safeText(seo.twitterSite || "");
    const resolvedPublishedTime = safeText(publishedTime);
    const resolvedModifiedTime = safeText(modifiedTime);
    const resolvedSection = trimText(section, 80);
    const schemaList = (Array.isArray(structuredData)
        ? structuredData
        : [structuredData]
    ).filter(Boolean);
    const headProps = resolvedTitle ? { title: resolvedTitle } : {};

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
            <meta head-key="og:locale" property="og:locale" content={resolvedLocale} />
            <meta head-key="twitter:card" name="twitter:card" content={resolvedTwitterCard} />
            <meta head-key="twitter:title" name="twitter:title" content={resolvedTitle} />
            <meta head-key="twitter:description" name="twitter:description" content={resolvedDescription} />
            <meta head-key="format-detection" name="format-detection" content="telephone=no,address=no,email=no" />
            <link head-key="canonical" rel="canonical" href={resolvedCanonical} />

            {preloadImages.map((item, index) => {
                const href = toAbsoluteUrl(item?.href, baseUrl);

                if (!href) {
                    return null;
                }

                return (
                    <link
                        key={`preload-image-${index}`}
                        head-key={`preload-image-${index}`}
                        rel="preload"
                        as="image"
                        href={href}
                        fetchpriority={item.fetchPriority || "high"}
                    />
                );
            })}

            {resolvedKeywords.length > 0 && (
                <meta
                    head-key="keywords"
                    name="keywords"
                    content={resolvedKeywords.join(", ")}
                />
            )}

            {resolvedImage && (
                <meta head-key="og:image" property="og:image" content={resolvedImage} />
            )}

            {resolvedImage && (
                <meta head-key="twitter:image" name="twitter:image" content={resolvedImage} />
            )}

            {resolvedImage && (
                <meta head-key="og:image:alt" property="og:image:alt" content={resolvedImageAlt} />
            )}

            {resolvedImage && (
                <meta head-key="twitter:image:alt" name="twitter:image:alt" content={resolvedImageAlt} />
            )}

            {resolvedImage && (
                <meta head-key="og:image:width" property="og:image:width" content="1200" />
            )}

            {resolvedImage && (
                <meta head-key="og:image:height" property="og:image:height" content="630" />
            )}

            {resolvedTwitterSite && (
                <meta head-key="twitter:site" name="twitter:site" content={resolvedTwitterSite} />
            )}

            {resolvedPublishedTime && (
                <meta
                    head-key="article:published_time"
                    property="article:published_time"
                    content={resolvedPublishedTime}
                />
            )}

            {resolvedModifiedTime && (
                <meta
                    head-key="article:modified_time"
                    property="article:modified_time"
                    content={resolvedModifiedTime}
                />
            )}

            {resolvedSection && (
                <meta
                    head-key="article:section"
                    property="article:section"
                    content={resolvedSection}
                />
            )}

            {schemaList.map((item, index) => {
                const json = safeJson(item);

                if (!json) {
                    return null;
                }

                return (
                    <script
                        key={`schema-${index}`}
                        head-key={`schema-${index}`}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: json,
                        }}
                    />
                );
            })}
        </Head>
    );
}
