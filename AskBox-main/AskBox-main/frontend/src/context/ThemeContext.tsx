import React, { createContext, useContext, useState, useEffect } from 'react';

type DesignSystem = 'legacy' | 'modern';

interface ThemeContextType {
    designSystem: DesignSystem;
    toggleDesignSystem: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [designSystem, setDesignSystem] = useState<DesignSystem>('legacy');

    const toggleDesignSystem = () => {
        setDesignSystem(prev => prev === 'legacy' ? 'modern' : 'legacy');
    };

    useEffect(() => {
        // Apply theme classes to body
        document.body.classList.remove('theme-legacy', 'theme-modern');
        document.body.classList.add(`theme-${designSystem}`);
        
        // Also toggle the 'dark' class for Tailwind because legacy uses dark mode by default
        if (designSystem === 'legacy') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [designSystem]);

    return (
        <ThemeContext.Provider value={{ designSystem, toggleDesignSystem }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
