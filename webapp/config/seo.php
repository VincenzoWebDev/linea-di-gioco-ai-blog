<?php

return [
    'site_name' => env('SEO_SITE_NAME', config('app.name', 'Linea di gioco')),
    'default_title' => env(
        'SEO_DEFAULT_TITLE',
        'Linea di gioco | Analisi geopolitiche e intelligence internazionale'
    ),
    'default_description' => env(
        'SEO_DEFAULT_DESCRIPTION',
        'Linea di gioco pubblica analisi geopolitiche, dossier internazionali e briefing AI su crisi, sicurezza, energia e scenari globali.'
    ),
    'default_locale' => 'it_IT',
    'default_type' => 'website',
    'twitter_card' => 'summary_large_image',
];
