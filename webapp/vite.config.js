import path from 'path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    resolve: {
        alias: {
            'ziggy-js': path.resolve(
                __dirname,
                'vendor/tightenco/ziggy/dist/index.esm.js'
            ),
        },
    },

    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    if (
                        id.includes('react-simple-maps') ||
                        id.includes('d3-')
                    ) {
                        return 'vendor-maps';
                    }

                    if (id.includes('framer-motion')) {
                        return 'vendor-motion';
                    }

                    if (id.includes('recharts')) {
                        return 'vendor-charts';
                    }

                    if (id.includes('react-fast-marquee')) {
                        return 'vendor-marquee';
                    }

                    return 'vendor';
                },
            },
        },
    },

    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
    ],
});