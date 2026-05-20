import { motion } from "framer-motion";

export default function IntelligenceRadarIcon() {
    return (
        <div className="relative h-6 w-6 rounded-full border border-[#D7B56D]">
            <motion.span
                className="absolute left-1/2 top-1/2 h-px w-3 origin-left bg-[#D7B56D]"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D7B56D]" />
        </div>
    );
}
