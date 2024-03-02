/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,ts,svelte}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                light: '#EBECF0',
                dark: '#111827',
                color0: '#00ADB5',
            },
        }
    },
    plugins: []
};
