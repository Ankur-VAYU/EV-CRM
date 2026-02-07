/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'vayu-green': '#14452F',
                'vayu-yellow': '#F4B400',
            }
        },
    },
    plugins: [],
}
