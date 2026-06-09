import BlogLayout from "@/Layouts/BlogLayout";
import HomeTensionTrend from "@/Components/blog/home/HomeTensionTrend";
import HomeCommandCenter from "@/Components/blog/home/HomeCommandCenter";
import HomeFeedSection from "@/Components/blog/home/HomeFeedSection";
import HomeLatestNewsSection from "@/Components/blog/home/HomeLatestNewsSection";
import HomeStatsSection from "@/Components/blog/home/HomeStatsSection";
import SeoHead from "@/Components/Seo/SeoHead";
import { buildHomeSeo } from "@/lib/blog/homeSeo";
import { resolveLcpImageUrl } from "@/lib/blog/operations";

export default function Welcome({
    feedItems = [],
    latestItems = [],
    locations = [],
    stats = {},
    globalTrend = {},
}) {
    const lcpImageUrl = resolveLcpImageUrl(feedItems[0]);

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
                <HomeCommandCenter operations={locations} />
                <HomeStatsSection
                    stats={stats}
                    hotspotsCount={locations.length}
                />
                <HomeFeedSection items={feedItems} />
                <HomeLatestNewsSection items={latestItems} />
                <HomeTensionTrend trend={globalTrend} />
            </BlogLayout>
        </>
    );
}
