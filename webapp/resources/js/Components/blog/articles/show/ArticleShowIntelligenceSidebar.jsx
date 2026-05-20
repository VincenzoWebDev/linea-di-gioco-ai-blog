import { motion } from "framer-motion";
import { Crosshair, Shield, Target } from "lucide-react";
import IntelligenceMetricBlock from "@/Components/blog/articles/show/IntelligenceMetricBlock";
import IntelligenceRadarChart from "@/Components/blog/articles/show/IntelligenceRadarChart";
import IntelligenceRadarIcon from "@/Components/blog/articles/show/IntelligenceRadarIcon";
import { getTrendConfig } from "@/lib/blog/trendCopy";

export default function ArticleShowIntelligenceSidebar({
    article,
    intelligence,
}) {
    const trend = getTrendConfig(article.tension?.trend_direction);
    const TrendIcon = trend.icon;

    return (
        <aside className="min-w-0 max-w-full lg:sticky lg:top-8 lg:self-start">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="border border-[#202A3D] bg-[#0B0F15]/90 p-4 shadow-2xl shadow-black/20 sm:p-5"
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#7E8796]">
                            Matrice operativa
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-[#F3F4F6]">
                            Impatto operativo
                        </h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D7B56D]/40 bg-[#D7B56D]/10">
                        <IntelligenceRadarIcon />
                    </div>
                </div>

                <div className="mt-5">
                    <IntelligenceRadarChart metrics={intelligence.metrics} />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    <IntelligenceMetricBlock
                        label="Rischio"
                        value={intelligence.riskScore}
                        icon={Crosshair}
                    />
                    <IntelligenceMetricBlock
                        label="Impatto"
                        value={intelligence.averageImpact}
                        icon={Target}
                    />
                    <IntelligenceMetricBlock
                        label="Fonte"
                        value={intelligence.qualityScore}
                        icon={Shield}
                    />
                </div>

                <div className="mt-5 grid gap-3">
                    <div className="flex items-center justify-between border border-[#202A3D] bg-[#121722] px-4 py-3">
                        <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7E8796]">
                                Tendenza
                            </p>
                            <p className="mt-1 text-sm text-[#D7DEE8]">
                                {trend.label}
                            </p>
                        </div>
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${trend.bg} ${trend.color}`}
                        >
                            <TrendIcon className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="border border-[#202A3D] bg-[#121722] px-4 py-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#7E8796]">
                            Scenari futuri
                        </p>
                        <p className="mt-3 font-mono text-sm leading-7 text-[#C8D0DC]">
                            {intelligence.scenario}
                        </p>
                    </div>
                </div>
            </motion.div>
        </aside>
    );
}
