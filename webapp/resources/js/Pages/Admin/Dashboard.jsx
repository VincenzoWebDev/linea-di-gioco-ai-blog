import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DashboardHero from "@/Components/admin/dashboard/DashboardHero";
import StatGrid from "@/Components/admin/dashboard/StatGrid";
import PipelineSummary from "@/Components/admin/dashboard/PipelineSummary";
import SectionGrid from "@/Components/admin/dashboard/SectionGrid";
import QueueCard from "@/Components/admin/dashboard/QueueCard";
import RecentIncomingCard from "@/Components/admin/dashboard/RecentIncomingCard";
import TensionsCard from "@/Components/admin/dashboard/TensionsCard";

export default function Dashboard({
    auth,
    stats = [],
    overview = {},
    pipeline = {},
    content = {},
    sections = [],
    tensions = {},
}) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-[1400px] space-y-8 sm:px-6 lg:px-8">
                    <DashboardHero overview={overview} />
                    <StatGrid stats={stats} />
                    <PipelineSummary pipeline={pipeline} content={content} />
                    <SectionGrid sections={sections} />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <QueueCard pendingByQueue={pipeline.pending_by_queue} />
                        <RecentIncomingCard items={pipeline.recent_incoming} />
                    </div>

                    <TensionsCard tensions={tensions} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
