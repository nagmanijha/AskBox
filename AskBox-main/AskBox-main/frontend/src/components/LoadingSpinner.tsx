import { useTheme } from '../context/ThemeContext';

export function LoadingSpinner() {
    const { designSystem } = useTheme();
    const isModern = designSystem === 'modern';

    return (
        <div className={`min-h-screen flex items-center justify-center ${isModern ? 'bg-slate-50' : 'bg-background-dark'}`}>
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${
                isModern ? 'border-indigo-600' : 'border-primary'
            }`} />
        </div>
    );
}
