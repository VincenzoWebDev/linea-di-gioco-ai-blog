import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head } from "@inertiajs/react";
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
    keywords.map((value) => safeText(value).trim()).filter(Boolean)
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
function SeoHead({
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
  author
}) {
  const { props, url } = usePage();
  const seo = props.seo || {};
  const siteName = trimText(seo.siteName || "Linea di gioco", 80);
  const baseUrl = safeText(seo.baseUrl || "http://127.0.0.1:8000");
  const resolvedTitle = trimText(title || seo.defaultTitle || siteName, 60);
  const resolvedDescription = trimText(
    description || seo.defaultDescription || "",
    160
  );
  const resolvedType = safeText(type || seo.defaultType || "website");
  const resolvedKeywords = normalizeKeywords(keywords);
  const resolvedRobots = safeText(
    robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
  );
  const resolvedCanonical = toAbsoluteUrl(canonicalUrl || url, baseUrl);
  const resolvedImage = toAbsoluteUrl(image || seo.defaultImage || "", baseUrl);
  const resolvedImageAlt = trimText(
    imageAlt || seo.defaultImageAlt || resolvedTitle || siteName,
    160
  );
  const resolvedAuthor = trimText(author || seo.defaultAuthor || siteName, 80);
  const resolvedLocale = safeText(seo.defaultLocale || "it_IT");
  const resolvedTwitterCard = safeText(
    resolvedImage ? seo.twitterCard || "summary_large_image" : "summary"
  );
  const resolvedTwitterSite = safeText(seo.twitterSite || "");
  const resolvedPublishedTime = safeText(publishedTime);
  const resolvedModifiedTime = safeText(modifiedTime);
  const resolvedSection = trimText(section, 80);
  const schemaList = (Array.isArray(structuredData) ? structuredData : [structuredData]).filter(Boolean);
  const headProps = resolvedTitle ? { title: resolvedTitle } : {};
  return /* @__PURE__ */ jsxs(Head, { ...headProps, children: [
    /* @__PURE__ */ jsx("meta", { "head-key": "description", name: "description", content: resolvedDescription }),
    /* @__PURE__ */ jsx("meta", { "head-key": "robots", name: "robots", content: resolvedRobots }),
    /* @__PURE__ */ jsx("meta", { "head-key": "author", name: "author", content: resolvedAuthor }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:type", property: "og:type", content: resolvedType }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:title", property: "og:title", content: resolvedTitle }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:description", property: "og:description", content: resolvedDescription }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:url", property: "og:url", content: resolvedCanonical }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:site_name", property: "og:site_name", content: siteName }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:locale", property: "og:locale", content: resolvedLocale }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:card", name: "twitter:card", content: resolvedTwitterCard }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:title", name: "twitter:title", content: resolvedTitle }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:description", name: "twitter:description", content: resolvedDescription }),
    /* @__PURE__ */ jsx("meta", { "head-key": "format-detection", name: "format-detection", content: "telephone=no,address=no,email=no" }),
    /* @__PURE__ */ jsx("link", { "head-key": "canonical", rel: "canonical", href: resolvedCanonical }),
    preloadImages.map((item, index) => {
      const href = toAbsoluteUrl(item?.href, baseUrl);
      if (!href) {
        return null;
      }
      return /* @__PURE__ */ jsx(
        "link",
        {
          "head-key": `preload-image-${index}`,
          rel: "preload",
          as: "image",
          href,
          fetchpriority: item.fetchPriority || "high"
        },
        `preload-image-${index}`
      );
    }),
    resolvedKeywords.length > 0 && /* @__PURE__ */ jsx(
      "meta",
      {
        "head-key": "keywords",
        name: "keywords",
        content: resolvedKeywords.join(", ")
      }
    ),
    resolvedImage && /* @__PURE__ */ jsx("meta", { "head-key": "og:image", property: "og:image", content: resolvedImage }),
    resolvedImage && /* @__PURE__ */ jsx("meta", { "head-key": "twitter:image", name: "twitter:image", content: resolvedImage }),
    resolvedImage && /* @__PURE__ */ jsx("meta", { "head-key": "og:image:alt", property: "og:image:alt", content: resolvedImageAlt }),
    resolvedImage && /* @__PURE__ */ jsx("meta", { "head-key": "twitter:image:alt", name: "twitter:image:alt", content: resolvedImageAlt }),
    resolvedImage && /* @__PURE__ */ jsx("meta", { "head-key": "og:image:width", property: "og:image:width", content: "1200" }),
    resolvedImage && /* @__PURE__ */ jsx("meta", { "head-key": "og:image:height", property: "og:image:height", content: "630" }),
    resolvedTwitterSite && /* @__PURE__ */ jsx("meta", { "head-key": "twitter:site", name: "twitter:site", content: resolvedTwitterSite }),
    resolvedPublishedTime && /* @__PURE__ */ jsx(
      "meta",
      {
        "head-key": "article:published_time",
        property: "article:published_time",
        content: resolvedPublishedTime
      }
    ),
    resolvedModifiedTime && /* @__PURE__ */ jsx(
      "meta",
      {
        "head-key": "article:modified_time",
        property: "article:modified_time",
        content: resolvedModifiedTime
      }
    ),
    resolvedSection && /* @__PURE__ */ jsx(
      "meta",
      {
        "head-key": "article:section",
        property: "article:section",
        content: resolvedSection
      }
    ),
    schemaList.map((item, index) => {
      const json = safeJson(item);
      if (!json) {
        return null;
      }
      return /* @__PURE__ */ jsx(
        "script",
        {
          "head-key": `schema-${index}`,
          type: "application/ld+json",
          dangerouslySetInnerHTML: {
            __html: json
          }
        },
        `schema-${index}`
      );
    })
  ] });
}
export {
  SeoHead as S
};
