<?php

namespace Tests\Unit;

use App\Services\RegionCoordinateResolver;
use Tests\TestCase;

class RegionCoordinateResolverTest extends TestCase
{
    public function test_it_infers_united_states_from_generic_region_and_context(): void
    {
        $resolver = app(RegionCoordinateResolver::class);

        $label = $resolver->canonicalRegionName(
            'Area non specificata',
            'La Corte Suprema degli USA valuta un ricorso federale a Washington.'
        );
        $coordinates = $resolver->resolve(
            'Area non specificata',
            'La Corte Suprema degli USA valuta un ricorso federale a Washington.'
        );

        $this->assertSame('Stati Uniti', $label);
        $this->assertSame(38.9072, $coordinates['lat']);
        $this->assertSame(-77.0369, $coordinates['long']);
    }

    public function test_it_prefers_south_china_sea_when_context_is_more_specific_than_china(): void
    {
        $resolver = app(RegionCoordinateResolver::class);

        $label = $resolver->canonicalRegionName(
            'Cina',
            'Pechino contesta le nuove manovre nel Mar Cinese Meridionale e rafforza la presenza navale nell area.'
        );

        $this->assertSame('Cina', $label);
    }

    public function test_it_uses_the_article_text_to_find_the_country(): void
    {
        $resolver = app(RegionCoordinateResolver::class);

        $text = 'Le autorita iraniane a Teheran valutano una risposta diplomatica e rafforzano il controllo interno.';

        $this->assertSame('Iran', $resolver->canonicalRegionNameFromText($text));
    }

    public function test_it_matches_adjective_inflections(): void
    {
        $resolver = app(RegionCoordinateResolver::class);

        // 'ucraine' is plural feminine adjective, should match Ukraine.
        $coordinates = $resolver->resolve(
            'Area non specificata',
            'Scontri di confine con le truppe ucraine.'
        );

        $this->assertNotNull($coordinates);
        $this->assertSame(50.4501, $coordinates['lat']);
        $this->assertSame(30.5234, $coordinates['long']);
    }

    public function test_it_resolves_generic_region_by_falling_back_to_context_ai_geocoding(): void
    {
        config()->set('ai_news.ai.enabled', true);
        config()->set('ai_news.ai.base_url', 'http://127.0.0.1:11434');
        config()->set('ai_news.ai.model', 'llama3.1');

        \Illuminate\Support\Facades\Http::fake([
            'http://127.0.0.1:11434/api/chat' => \Illuminate\Support\Facades\Http::response([
                'message' => [
                    'content' => '{"lat":42.4413,"long":19.2636}',
                ],
            ], 200),
        ]);

        $resolver = app(RegionCoordinateResolver::class);

        // 'Area non specificata' is generic, context is not in static config.
        // It should fallback to context for AI resolution.
        $coordinates = $resolver->resolve(
            'Area non specificata',
            'Tensione diplomatica nel palazzo del governo a Podgorica.'
        );

        $this->assertNotNull($coordinates);
        $this->assertSame(42.4413, $coordinates['lat']);
        $this->assertSame(19.2636, $coordinates['long']);
    }

    public function test_it_handles_italy_and_other_newly_added_regions(): void
    {
        $resolver = app(RegionCoordinateResolver::class);

        // Direct matching of a newly added region
        $coordinates = $resolver->resolve('Italia');
        $this->assertNotNull($coordinates);
        $this->assertSame(41.9028, $coordinates['lat']);
        $this->assertSame(12.4964, $coordinates['long']);

        // Context matching of a newly added region
        $coordinatesFromText = $resolver->resolve(
            'Area non specificata',
            'Il governo di Atene annuncia nuove riforme militari.'
        );
        $this->assertNotNull($coordinatesFromText);
        $this->assertSame(37.9838, $coordinatesFromText['lat']);
        $this->assertSame(23.7275, $coordinatesFromText['long']);
    }
}
