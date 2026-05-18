<?php

namespace App\Http\Middleware;

use App\Services\GeopoliticalTensionService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'seo' => [
                'siteName' => config('seo.site_name'),
                'baseUrl' => rtrim(config('app.url'), '/'),
                'defaultTitle' => config('seo.default_title'),
                'defaultDescription' => config('seo.default_description'),
                'defaultLocale' => config('seo.default_locale'),
                'defaultType' => config('seo.default_type'),
                'twitterCard' => config('seo.twitter_card'),
            ],
            'geopoliticalTensions' => fn () => app(GeopoliticalTensionService::class)
                ->topForHeader()
                ->all(),
        ];
    }
}
