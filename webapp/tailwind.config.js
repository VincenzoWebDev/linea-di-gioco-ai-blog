import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    safelist: [
        'border-[#EF4444]/50',
        'bg-[#EF4444]/10',
        'text-[#FCA5A5]',
        'border-[#F97316]/50',
        'bg-[#F97316]/10',
        'text-[#FDBA74]',
        'border-[#D7B56D]/50',
        'bg-[#D7B56D]/10',
        'text-[#FDE68A]',
        'border-[#22C55E]/50',
        'bg-[#22C55E]/10',
        'text-[#86EFAC]',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                serif: ['"Source Serif 4"', ...defaultTheme.fontFamily.serif],
            },
            keyframes: {
                'card-reveal': {
                    '0%': { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
                    '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
                },
            },
            animation: {
                'card-reveal': 'card-reveal 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            },
        },
    },

    plugins: [forms],
};
