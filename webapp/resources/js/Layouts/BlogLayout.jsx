import BlogHeader from "@/Components/blog/BlogHeader";
import BlogFooter from "@/Components/blog/BlogFooter";

export default function BlogLayout({ children }) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0E1116] text-[#E5E7EB] font-sans">
            <div className="relative overflow-x-hidden">
                <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[#1F3A5F]/40 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-48 left-10 h-[420px] w-[420px] rounded-full bg-[#9E2A2B]/30 blur-[140px]" />

                <BlogHeader />

                <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 text-base leading-[1.7] sm:px-6 sm:pb-20 sm:pt-12 sm:text-[17px]">
                    {children}
                </main>

                <BlogFooter />
            </div>
        </div>
    );
}
