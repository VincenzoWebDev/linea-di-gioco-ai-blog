import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";

export default function FeaturedCard({ title, description, tag, meta, href }) {
    const Wrapper = href ? Link : "div";

    return (
        <Card className="h-full border border-[#1C2333] bg-[#131823] text-[#E5E7EB] shadow-[0_30px_60px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-[#2A354D]">
            <Wrapper
                {...(href ? { href, className: "flex h-full flex-col" } : { className: "flex h-full flex-col" })}
            >
                <CardHeader>
                    <CardDescription className="text-[#9CA3AF]">{tag}</CardDescription>
                    <CardTitle className="font-serif text-2xl leading-tight">{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                    <p className="text-[#9CA3AF]">{description}</p>
                    <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                        <span>{meta}</span>
                        <span className="inline-flex items-center gap-2 text-[#9E2A2B]">
                            Apri
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                </CardContent>
            </Wrapper>
        </Card>
    );
}
