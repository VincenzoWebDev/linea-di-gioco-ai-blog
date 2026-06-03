import { Clock3, MapPin } from "lucide-react";
import { formatPublishedAt } from "@/lib/blog/formatters";
import { trendCopy } from "@/lib/blog/trendCopy";

export function buildArticleChips(article) {
    const chips = [];

    const region =
        article.display_region_name ||
        article.region_name ||
        article.topic ||
        (Array.isArray(article.categories) ? article.categories[0] : null);

    if (region) {
        chips.push({ icon: MapPin, value: region });
    }

    const trend = trendCopy[article.trend_direction];

    if (trend) {
        chips.push({ icon: trend.icon, value: trend.label });
    }

    chips.push({
        icon: Clock3,
        value: formatPublishedAt(article.published_at),
    });

    return chips;
}
