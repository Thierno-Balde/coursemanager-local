import React from 'react';
import { useStore } from '../context/StoreContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const isDark = settings.theme === 'dark';

    const toggleTheme = () => {
        updateSettings({ theme: isDark ? 'light' : 'dark' });
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;
