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
}
