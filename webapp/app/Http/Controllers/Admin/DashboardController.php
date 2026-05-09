<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentRun;
use App\Models\Article;
use App\Models\Category;
use App\Models\IncomingNews;
use App\Models\NewsSource;
use App\Models\PublicationLog;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sevenDaysAgo = $now->copy()->subDays(7);
        $eightWeeksAgo = $now->copy()->startOfWeek()->subWeeks(7);

        $publishedArticles = Article::query()->where('status', 'published')->count();
        $draftArticles = Article::query()->where('status', 'draft')->count();
        $reviewArticles = Article::query()->where('status', 'review')->count();
        $totalArticles = Article::query()->count();

        $incomingLast30Days = IncomingNews::query()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->count();
        $validatedLast30Days = IncomingNews::query()
            ->where('status', 'validated')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->count();
        $rejectedLast30Days = IncomingNews::query()
            ->where('status', 'rejected')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->count();

        $agentRunsLast30Days = AgentRun::query()
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->count();
        $agentFailuresLast30Days = AgentRun::query()
            ->where('status', 'failed')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->count();

        $pendingJobs = (int) DB::table('jobs')->count();
        $pendingByQueue = DB::table('jobs')
            ->select('queue', DB::raw('COUNT(*) as total'))
            ->groupBy('queue')
            ->pluck('total', 'queue')
            ->map(fn ($value) => (int) $value)
            ->all();

        $incomingTrend = $this->dailyCounts(
            IncomingNews::query()->where('created_at', '>=', $sevenDaysAgo),
            'created_at',
            7
        );
        $publishedTrend = $this->weeklyCounts(
            Article::query()
                ->where('status', 'published')
                ->whereNotNull('published_at')
                ->where('published_at', '>=', $eightWeeksAgo),
            'published_at',
            8
        );
        $agentTrend = $this->weeklyCounts(
            AgentRun::query()->where('created_at', '>=', $eightWeeksAgo),
            'created_at',
            8
        );

        $statusBreakdown = [
            'raw' => IncomingNews::query()->where('status', 'raw')->count(),
            'queued' => IncomingNews::query()->where('status', 'queued')->count(),
            'extracted' => IncomingNews::query()->where('status', 'extracted')->count(),
            'sanitized' => IncomingNews::query()->where('status', 'sanitized')->count(),
            'validated' => IncomingNews::query()->where('status', 'validated')->count(),
            'rejected' => IncomingNews::query()->where('status', 'rejected')->count(),
        ];

        $successRate = $incomingLast30Days > 0
            ? round(($validatedLast30Days / $incomingLast30Days) * 100, 1)
            : 0.0;
        $agentFailureRate = $agentRunsLast30Days > 0
            ? round(($agentFailuresLast30Days / $agentRunsLast30Days) * 100, 1)
            : 0.0;

        $recentIncoming = IncomingNews::query()
            ->with('source:id,name')
            ->latest('created_at')
            ->limit(5)
            ->get(['id', 'news_source_id', 'title', 'status', 'created_at'])
            ->map(fn (IncomingNews $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'status' => $item->status,
                'source' => $item->source?->name,
                'created_at' => optional($item->created_at)->toISOString(),
            ])
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                [
                    'title' => 'Articoli pubblicati',
                    'value' => $publishedArticles,
                    'delta' => $draftArticles.' bozze',
                    'note' => 'Contenuti live',
                    'tone' => 'from-sky-500/20 to-sky-500/5',
                ],
                [
                    'title' => 'News acquisite',
                    'value' => $incomingLast30Days,
                    'delta' => $validatedLast30Days.' validate',
                    'note' => 'Ultimi 30 giorni',
                    'tone' => 'from-emerald-500/20 to-emerald-500/5',
                ],
                [
                    'title' => 'Tasso validazione',
                    'value' => $successRate.'%',
                    'delta' => $rejectedLast30Days.' scartate',
                    'note' => 'Pipeline AI',
                    'tone' => 'from-indigo-500/20 to-indigo-500/5',
                ],
                [
                    'title' => 'Job in coda',
                    'value' => $pendingJobs,
                    'delta' => $agentFailureRate.'% fail',
                    'note' => 'Queue e agenti',
                    'tone' => 'from-rose-500/20 to-rose-500/5',
                ],
            ],
            'overview' => [
                'headline' => 'Contenuti e pipeline sotto controllo.',
                'subheadline' => 'Monitoraggio reale di acquisizione fonti, sanitizzazione, validazione e pubblicazione.',
                'trend_label' => 'Run agenti ultime 8 settimane',
            ],
            'charts' => [
                'agent_runs' => $agentTrend,
                'published_articles' => $publishedTrend,
                'incoming_week' => $incomingTrend,
            ],
            'pipeline' => [
                'pending_jobs' => $pendingJobs,
                'pending_by_queue' => $pendingByQueue,
                'status_breakdown' => $statusBreakdown,
                'recent_incoming' => $recentIncoming,
            ],
            'content' => [
                'drafts' => $draftArticles,
                'review' => $reviewArticles,
                'published' => $publishedArticles,
            ],
            'sections' => [
                [
                    'title' => 'Fonti',
                    'description' => 'Monitoraggio delle sorgenti RSS e API attive.',
                    'meta' => NewsSource::query()->where('is_active', true)->count().' fonti attive',
                ],
                [
                    'title' => 'Articoli',
                    'description' => 'Contenuti creati dalla pipeline e dall’admin.',
                    'meta' => $totalArticles.' articoli totali',
                ],
                [
                    'title' => 'Categorie',
                    'description' => 'Classificazione editoriale disponibile nel blog.',
                    'meta' => Category::query()->where('is_active', true)->count().' categorie attive',
                ],
                [
                    'title' => 'Pipeline AI',
                    'description' => 'Stato di ingestione, sanificazione e pubblicazione.',
                    'meta' => $incomingLast30Days.' item processati / 30 giorni',
                ],
                [
                    'title' => 'Log pubblicazione',
                    'description' => 'Eventi registrati durante il ciclo editoriale.',
                    'meta' => PublicationLog::query()->count().' eventi salvati',
                ],
                [
                    'title' => 'Utenti',
                    'description' => 'Accessi abilitati al pannello di amministrazione.',
                    'meta' => User::query()->count().' utenti',
                ],
            ],
        ]);
    }

    private function dailyCounts($query, string $column, int $days): array
    {
        $rows = $query
            ->selectRaw('DATE('.$column.') as bucket, COUNT(*) as total')
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->pluck('total', 'bucket');

        return collect(range($days - 1, 0))
            ->map(function (int $offset) use ($rows) {
                $bucket = Carbon::now()->subDays($offset)->toDateString();

                return (int) ($rows[$bucket] ?? 0);
            })
            ->values()
            ->all();
    }

    private function weeklyCounts($query, string $column, int $weeks): array
    {
        $rows = $query
            ->selectRaw('YEAR('.$column.') as yr, WEEK('.$column.', 3) as wk, COUNT(*) as total')
            ->groupBy('yr', 'wk')
            ->orderBy('yr')
            ->orderBy('wk')
            ->get()
            ->keyBy(fn ($row) => $row->yr.'-'.$row->wk);

        return collect(range($weeks - 1, 0))
            ->map(function (int $offset) use ($rows) {
                $date = Carbon::now()->startOfWeek()->subWeeks($offset);
                $key = $date->year.'-'.$date->weekOfYear;

                return (int) ($rows[$key]->total ?? 0);
            })
            ->values()
            ->all();
    }
}
