import { memo } from "react";
import { Activity, MapPin } from "lucide-react";
import ArticleIntelligenceCard from "@/Components/blog/articles/ArticleIntelligenceCard";
import { severityBadge } from "@/lib/geopoliticalSeverity";
import { trendCopy } from "@/lib/blog/trendCopy";

function OperationIntelligenceCard({ item, index }) {
    const TrendIcon = trendCopy[item.trend_direction]?.icon || Activity;

    return (
        <ArticleIntelligenceCard
            article={{
                id: item.article?.id ?? item.id,
                slug: item.article?.slug ?? String(item.id),
                title: item.title,
                summary: item.summary,
                cover_url: item.cover_url,
                thumb_url: item.thumb_url,
                operation_code: item.operation_code,
            }}
            index={index}
            href={item.url || route("blog.articles.index")}
            ctaLabel="Analizza dossier"
            statusBadge={severityBadge(item.severity)}
            imageLoading={index === 0 ? "eager" : "lazy"}
            imageFetchPriority={index === 0 ? "high" : "auto"}
            chips={[
                { icon: MapPin, value: item.display_region_name || item.region_name || "Hotspot" },
                {
                    icon: TrendIcon,
                    value: trendCopy[item.trend_direction]?.label || "Stabile",
                },
            ]}
        />
    );
}

export default memo(OperationIntelligenceCard);
