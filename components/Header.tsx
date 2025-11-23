import React from 'react';
import { FlaskConical, Atom, Moon, Sun } from 'lucide-react';

interface HeaderProps {
    darkMode: boolean;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme }) => {
    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
                        <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent">
                            QuimicAI
                        </h1>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                        aria-label="Toggle Dark Mode"
                    >
                        {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="hidden sm:flex items-center space-x-2 text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-4">
                        <Atom className="w-5 h-5 animate-spin-slow" />
                        <span className="text-sm">Powered by Gemini 3 Pro</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;