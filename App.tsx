import React, { useState, useEffect } from 'react';
import { solveChemistryProblem } from './services/geminiService';
import Header from './components/Header';
import InputArea from './components/InputArea';
import SolutionView from './components/SolutionView';
import HistorySidebar from './components/HistorySidebar';
import { HistoryItem, SolverStatus } from './types';
import { AlertCircle, History as HistoryIcon, X } from 'lucide-react';

const App: React.FC = () => {
    const [status, setStatus] = useState<SolverStatus>(SolverStatus.IDLE);
    const [result, setResult] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) {
                return saved === 'true';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const savedHistory = localStorage.getItem('chemHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    // Dark Mode Effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);

    const saveToHistory = (question: string, answer: string, imagePreview?: string) => {
        const newItem: HistoryItem = {
            id: Date.now().toString(),
            question: question || "Análisis de Imagen",
            answer,
            timestamp: Date.now(),
            imagePreview
        };
        const newHistory = [newItem, ...history];
        setHistory(newHistory);
        localStorage.setItem('chemHistory', JSON.stringify(newHistory));
    };

    const handleSolve = async (text: string, image: File | null) => {
        setStatus(SolverStatus.THINKING);
        setError(null);
        setResult(null);
        setCurrentQuestion(text);

        try {
            let imageBase64: string | undefined;
            if (image) {
                imageBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        // remove data:image/jpeg;base64, prefix
                        const base64 = result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(image);
                });
            }

            const solution = await solveChemistryProblem(text, imageBase64, image?.type);
            
            setResult(solution);
            setStatus(SolverStatus.COMPLETED);
            
            // Create a preview URL for history if image exists
            let imagePreviewUrl;
            if (image) {
                 const reader = new FileReader();
                 reader.readAsDataURL(image);
                 reader.onloadend = () => {
                     saveToHistory(text, solution, "image_present");
                 }
            } else {
                saveToHistory(text, solution);
            }

        } catch (err: any) {
            setStatus(SolverStatus.ERROR);
            setError(err.message || "Ocurrió un error inesperado.");
        }
    };

    const handleReset = () => {
        setStatus(SolverStatus.IDLE);
        setResult(null);
        setError(null);
        setCurrentQuestion('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setResult(item.answer);
        setCurrentQuestion(item.question);
        setStatus(SolverStatus.COMPLETED);
        setError(null);
        if (window.innerWidth < 1024) {
            setIsHistoryOpen(false);
        }
    };

    const clearHistory = () => {
        if (confirm("¿Estás seguro de querer borrar todo el historial?")) {
            setHistory([]);
            localStorage.removeItem('chemHistory');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
            <Header darkMode={darkMode} toggleTheme={toggleTheme} />
            
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative">
                
                {/* Introduction / Empty State */}
                {status === SolverStatus.IDLE && !result && (
                    <div className="text-center py-10 animate-fade-in">
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
                            Tu asistente personal de química
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Sube una foto de tu tarea o escribe el problema. Desde estequiometría básica hasta cinética avanzada y termodinámica. <br/>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Resoluciones detalladas paso a paso.</span>
                        </p>
                    </div>
                )}

                {/* Main Input Area */}
                <div className="w-full max-w-3xl mx-auto z-10">
                    <InputArea onSolve={handleSolve} isSolving={status === SolverStatus.THINKING} />
                </div>

                {/* Error Display */}
                {status === SolverStatus.ERROR && (
                    <div className="w-full max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-700 dark:text-red-400 animate-shake">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Results Display */}
                {result && (
                    <div className="w-full max-w-4xl mx-auto pb-20">
                         <SolutionView markdown={result} onReset={handleReset} />
                    </div>
                )}
            </main>

            {/* Floating History Button (Mobile/Desktop) */}
            <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="fixed bottom-6 right-6 p-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-2xl hover:bg-indigo-50 dark:hover:bg-slate-700 border border-indigo-100 dark:border-slate-700 z-50 transition-transform hover:scale-105 active:scale-95"
                title="Historial"
            >
                {isHistoryOpen ? <X className="w-6 h-6" /> : <HistoryIcon className="w-6 h-6" />}
            </button>

            {/* History Sidebar */}
            <HistorySidebar 
                history={history} 
                onSelect={handleHistorySelect} 
                onClear={clearHistory}
                isOpen={isHistoryOpen}
            />

            {/* Overlay for sidebar on mobile */}
            {isHistoryOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsHistoryOpen(false)}
                />
            )}
        </div>
    );
};

export default App;