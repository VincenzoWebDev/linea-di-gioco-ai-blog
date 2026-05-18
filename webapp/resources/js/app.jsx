import './bootstrap';
import '../css/app.css';

import { createRoot, hydrateRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { installRoute, resolvePage, titleCallback } from './inertiaShared';

createInertiaApp({
    title: titleCallback,
    resolve: resolvePage,
    setup({ el, App, props }) {
        installRoute(props.initialPage.props);

        if (el.hasChildNodes()) {
            hydrateRoot(el, <App {...props} />);

            return;
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
