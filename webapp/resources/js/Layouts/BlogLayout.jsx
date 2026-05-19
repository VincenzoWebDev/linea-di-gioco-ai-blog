import { useEffect } from "react";
import BlogHeader from "@/Components/blog/BlogHeader";
import BlogFooter from "@/Components/blog/BlogFooter";
import CookieBanner from "@/Components/ui/CookieBanner";
import { usePage } from "@inertiajs/react";
import useAnalytics from "@/hooks/useAnalytics";
import { loadGA } from "@/services/analytics";

export default function BlogLayout({ children }) {
    const { auth } = usePage().props;

    useAnalytics();

    useEffect(() => {
        const handler = () => {
            const saved = JSON.parse(
                localStorage.getItem("cookie_consent") || "null",
            );

            if (saved?.analytics) {
                loadGA();
            }
        };

        window.addEventListener("cookie-consent-updated", handler);

        return () =>
            window.removeEventListener("cookie-consent-updated", handler);
    }, []);

    return (
        <div className="min-h-screen overflow-hidden bg-[#0E1116] text-[#E5E7EB] font-sans">
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute z-0 -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[#1F3A5F]/40 blur-[120px]" />
                <div className="pointer-events-none absolute z-0 -bottom-48 left-10 h-[420px] w-[420px] rounded-full bg-[#9E2A2B]/30 blur-[140px]" />

                <BlogHeader />

                <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 text-base leading-[1.7] sm:px-6 sm:pb-20 sm:pt-12 sm:text-[17px]">
                    {children}
                    {auth?.isLogged ? null : <CookieBanner />}
                </main>

                <BlogFooter />
            </div>
        </div>
    );
}
