import BlogHeader from "@/Components/blog/BlogHeader";
import BlogFooter from "@/Components/blog/BlogFooter";

export default function BlogLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#0E1116] text-[#E5E7EB] font-sans">
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[#1F3A5F]/40 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-48 left-10 h-[420px] w-[420px] rounded-full bg-[#9E2A2B]/30 blur-[140px]" />

                <BlogHeader />

                <main className="mx-auto max-w-6xl px-6 pb-20 pt-12 text-[17px] leading-[1.7]">
                    {children}
                </main>

                <BlogFooter />
            </div>
        </div>
    );
}
