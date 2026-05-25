import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";

export default function SectionGrid({ sections = [] }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
                <Card
                    key={section.title}
                    className="transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <CardHeader>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-slate-700">{section.meta}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
