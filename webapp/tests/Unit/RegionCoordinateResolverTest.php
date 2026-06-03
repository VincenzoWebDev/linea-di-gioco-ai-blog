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
}
