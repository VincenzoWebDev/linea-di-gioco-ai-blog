<?php

namespace App\Console\Commands;

use App\Services\GeopoliticalTensionService;
use Illuminate\Console\Command;

class CoolGeopoliticalTensionsCommand extends Command
{
    protected $signature = 'geopolitical:cool-tensions';

    protected $description = 'Applica il raffreddamento esponenziale alle tensioni geopolitiche';

    public function handle(GeopoliticalTensionService $tensionService): int
    {
        $updated = $tensionService->coolTensions();

        $this->info("Tensioni raffreddate: {$updated}");

        return self::SUCCESS;
    }
}
