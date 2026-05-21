import { useMemo } from "react";
import BlogLayout from "@/Layouts/BlogLayout";
import HomeBriefingSection from "@/Components/blog/home/HomeBriefingSection";
import HomeCommandCenter from "@/Components/blog/home/HomeCommandCenter";
import HomeFeedSection from "@/Components/blog/home/HomeFeedSection";
import HomeLatestNewsSection from "@/Components/blog/home/HomeLatestNewsSection";
import HomeStatsSection from "@/Components/blog/home/HomeStatsSection";
import SeoHead from "@/Components/Seo/SeoHead";
import { buildHomeSeo } from "@/lib/blog/homeSeo";
import { normalizeOperations, resolveLcpImageUrl } from "@/lib/blog/operations";

export default function Welcome({
    latestArticles = [],
    locations = [],
    historicalOperations = [],
    stats = {},
}) {
    const operations = useMemo(
        () => normalizeOperations(locations, []),
        [locations],
    );
    const feedItems = useMemo(
        () =>
            operations.length > 0
                ? operations
                : historicalOperations.length === 0
                  ? normalizeOperations([], latestArticles)
                  : [],
        [operations, historicalOperations, latestArticles],
    );
    const lcpImageUrl = useMemo(
        () => resolveLcpImageUrl(feedItems[0]),
        [feedItems],
    );

    const canonicalUrl = route("home");
    const seo = buildHomeSeo(canonicalUrl);

    return (
        <>
            <SeoHead
                {...seo}
                preloadImages={
                    lcpImageUrl
                        ? [{ href: lcpImageUrl, fetchPriority: "high" }]
                        : []
                }
            />
            <BlogLayout>
                <HomeCommandCenter operations={operations} />
                <HomeStatsSection
                    stats={stats}
                    hotspotsCount={operations.length}
                />
                <HomeFeedSection items={feedItems} />
                <HomeLatestNewsSection articles={latestArticles} />
                <HomeBriefingSection items={historicalOperations} />
            </BlogLayout>
        </>
    );
}
