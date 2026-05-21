import { Activity, TrendingDown, TrendingUp } from "lucide-react";
const trendCopy = {
  rising: { label: "Escalation", icon: TrendingUp },
  falling: { label: "Decompressione", icon: TrendingDown },
  stable: { label: "Stabile", icon: Activity }
};
function getTrendConfig(direction) {
  if (direction === "rising") {
    return {
      icon: TrendingUp,
      label: "In crescita",
      color: "text-[#EF4444]",
      bg: "bg-[#EF4444]/10"
    };
  }
  if (direction === "falling") {
    return {
      icon: TrendingDown,
      label: "In calo",
      color: "text-[#38BDF8]",
      bg: "bg-[#38BDF8]/10"
    };
  }
  return {
    icon: Activity,
    label: "Stabile",
    color: "text-[#D7B56D]",
    bg: "bg-[#D7B56D]/10"
  };
}
export {
  getTrendConfig as g,
  trendCopy as t
};
