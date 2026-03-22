<<<<<<< HEAD
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                display: ['Plus Jakarta Sans', 'sans-serif'],
            },
            colors: {
                primary: 'var(--color-brand)',
                'background-dark': 'var(--color-bg-main)',
                'background-light': '#f8f7f5',
                'accent-teal': 'var(--color-accent)',
                'teal-accent': 'var(--color-accent)',
                'surface-dark': 'var(--color-bg-surface)', 
                'border-dark': 'var(--color-border)',
                'slate-custom': 'var(--color-bg-sidebar)',
            },
            textColor: {
                skin: {
                    base: 'var(--color-text-primary)',
                    muted: 'var(--color-text-secondary)',
                }
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '1rem',
                xl: '1.5rem',
                '2xl': '1.5rem',
                full: '9999px',
            },
            keyframes: {
                move: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(500%)' },
                }
            },
            animation: {
                'move': 'move 5s infinite',
            }
        },
    },
    plugins: [],
};
=======
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                display: ['Plus Jakarta Sans', 'sans-serif'],
            },
            colors: {
                primary: '#f4ab25',
                'background-dark': '#0a0f1c',
                'background-light': '#f8f7f5',
                'accent-teal': '#2dd4bf',
                'teal-accent': '#2dd4bf',
                'surface-dark': '#111827', // Slate 900 equivalent
                'border-dark': '#1e293b',  // Slate 800 equivalent
                'slate-custom': '#0f172a', // Slate 950 equivalent
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '1rem',
                xl: '1.5rem',
                '2xl': '1.5rem',
                full: '9999px',
            },
            keyframes: {
                move: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(500%)' },
                }
            },
            animation: {
                'move': 'move 5s infinite',
            }
        },
    },
    plugins: [],
};
>>>>>>> pr-3
