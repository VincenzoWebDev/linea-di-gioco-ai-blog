<?php

namespace App\Http\Middleware;

use App\Services\GeopoliticalTensionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

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
                'isLogged' => fn() => Auth::check(),
            ],
            'ziggy' => fn() => [
                ...(new Ziggy(null, $request->root()))->toArray(),
                'location' => $request->fullUrl(),
            ],
            'seo' => [
                'siteName' => config('seo.site_name'),
                'baseUrl' => rtrim(config('app.url'), '/'),
                'defaultTitle' => config('seo.default_title'),
                'defaultDescription' => config('seo.default_description'),
                'defaultAuthor' => config('seo.default_author'),
                'defaultLocale' => config('seo.default_locale'),
                'defaultType' => config('seo.default_type'),
                'twitterCard' => config('seo.twitter_card'),
                'twitterSite' => config('seo.twitter_site'),
                'defaultImage' => config('seo.default_image'),
                'defaultImageAlt' => config('seo.default_image_alt'),
                'organizationName' => config('seo.organization_name'),
            ],
            'geopoliticalTensions' => fn() => app(GeopoliticalTensionService::class)
                ->topForHeader()
                ->all(),
        ];
    }
}
