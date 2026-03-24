/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                display: ['Plus Jakarta Sans', 'sans-serif'],
                headline: ['Public Sans', 'sans-serif'],
                body: ['Public Sans', 'sans-serif'],
                label: ['Public Sans', 'sans-serif'],
            },
            colors: {
                // CSS-variable-driven tokens (adapt to theme)
                primary: 'var(--color-brand)',
                'background-dark': 'var(--color-bg-main)',
                'background-light': '#f8f7f5',
                'accent-teal': 'var(--color-accent)',
                'teal-accent': 'var(--color-accent)',
                'surface-dark': 'var(--color-bg-surface)',
                'border-dark': 'var(--color-border)',
                'slate-custom': 'var(--color-bg-sidebar)',

                // MD3 color palette (from Rishabh) — used by SecretariatUI & PhoneUI
                "surface-dim": "#d8dadd",
                "outline": "#717783",
                "on-surface": "#191c1e",
                "error": "#ba1a1a",
                "surface-variant": "#e0e3e6",
                "surface-tint": "#005faf",
                "on-secondary": "#ffffff",
                "secondary": "#4c616c",
                "tertiary-container": "#ba5b00",
                "inverse-surface": "#2d3133",
                "primary-container": "#1976d2",
                "surface-bright": "#f7f9fc",
                "background": "#f7f9fc",
                "on-background": "#191c1e",
                "inverse-on-surface": "#eff1f4",
                "outline-variant": "#c1c6d4",
                "inverse-primary": "#a5c8ff",
                "surface-container-highest": "#e0e3e6",
                "surface": "#f7f9fc",
                "surface-container-low": "#f2f4f7",
                "surface-container": "#eceef1",
                "secondary-container": "#cfe6f2",
                "on-surface-variant": "#414752",
                "on-error": "#ffffff",
                "error-container": "#ffdad6",
                "tertiary": "#944700",
                "on-primary": "#ffffff",
                "surface-container-lowest": "#ffffff",
                "surface-container-high": "#e6e8eb",

                // Section / Persona Themes (from Rishabh)
                "farmer-primary": "#2e7d32",   // Green
                "female-primary": "#d81b60",   // Pink
                "student-primary": "#1565c0",  // Blue
                "senior-primary": "#ef6c00",   // Amber/Orange
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
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'move': 'move 5s infinite',
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
};

