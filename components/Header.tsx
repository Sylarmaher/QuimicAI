import React from 'react';
import { FlaskConical, Atom } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                            QuimicAI
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Resolutor Experto</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-slate-500">
                    <Atom className="w-5 h-5 animate-spin-slow" />
                    <span className="text-sm">Powered by Gemini 3 Pro</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
