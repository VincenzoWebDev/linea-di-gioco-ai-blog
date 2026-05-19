<?php

return [
    'site_name' => env('SEO_SITE_NAME', 'Linea di gioco'),
    'default_title' => env(
        'SEO_DEFAULT_TITLE',
        'Linea di gioco | Analisi geopolitiche e intelligence internazionale'
    ),
    'default_description' => env(
        'SEO_DEFAULT_DESCRIPTION',
        'Linea di gioco pubblica analisi geopolitiche, dossier internazionali e briefing AI su crisi, sicurezza, energia e scenari globali.'
    ),
    'default_author' => env('SEO_DEFAULT_AUTHOR', 'Linea di gioco'),
    'default_locale' => 'it_IT',
    'default_type' => 'website',
    'twitter_card' => 'summary_large_image',
    'twitter_site' => env('SEO_TWITTER_SITE'),
    'default_image' => env('SEO_DEFAULT_IMAGE', '/images/seo-default.svg'),
    'default_image_alt' => env(
        'SEO_DEFAULT_IMAGE_ALT',
        'Linea di gioco, analisi geopolitiche e dossier internazionali'
    ),
    'organization_name' => env('SEO_ORGANIZATION_NAME', 'Linea di gioco'),
];
