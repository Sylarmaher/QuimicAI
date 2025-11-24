import React, { useState, useRef } from 'react';
import { Send, ImagePlus, X, Loader2, Keyboard, ChevronDown, ChevronUp } from 'lucide-react';

interface InputAreaProps {
    onSolve: (text: string, image: File | null) => void;
    isSolving: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSolve, isSolving }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showKeyboard, setShowKeyboard] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const chemSymbols = [
        { category: "Números", symbols: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
        { category: "Math", symbols: ["+", "-", "×", "÷", "=", "±", "√", "·", "≈", "≠", "∞", "%"] },
        { category: "Cálculo", symbols: ["∫", "∬", "∂", "d", "∇", "|", "∑", "dx", "dy", "dt", "'"] },
        { category: "Constantes", symbols: ["π", "e", "R", "k", "h"] },
        { category: "Reacción", symbols: ["→", "⇌", "↑", "↓", "∆"] },
        { category: "Estructura", symbols: ["[", "]", "(", ")", "{", "}"] },
        { category: "Estados", symbols: ["(s)", "(l)", "(g)", "(aq)", "°"] },
        { category: "Sub/Super", symbols: ["₀", "₁", "₂", "₃", "₄", "⁺", "⁻", "²", "³"] },
        { category: "Griegas", symbols: ["α", "β", "γ", "δ", "ε", "λ", "μ", "ν", "π", "ρ", "σ", "τ", "φ", "ω", "Ω"] },
    ];

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const insertSymbol = (symbol: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + symbol + text.substring(end);

        setPrompt(newText);

        // Restore focus and move cursor after inserted symbol
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + symbol.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!prompt.trim() && !selectedImage) || isSolving) return;
        onSolve(prompt, selectedImage);
        setPrompt('');
        clearImage();
        setShowKeyboard(false);
    };

    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
            {imagePreview && (
                <div className="relative w-full p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative inline-block">
                        <img 
                            src={imagePreview} 
                            alt="Problem Preview" 
                            className="h-32 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm object-cover" 
                        />
                        <button 
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-4">
                <div className="relative">
                    {/* Symbol Keyboard Toolbar */}
                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-2">
                             <button
                                type="button"
                                onClick={() => setShowKeyboard(!showKeyboard)}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 hover:underline focus:outline-none"
                            >
                                <Keyboard className="w-4 h-4" />
                                <span>{showKeyboard ? "Ocultar símbolos" : "Mostrar símbolos químicos y matemáticos"}</span>
                                {showKeyboard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        </div>
                        
                        {showKeyboard && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 mb-2 animate-fade-in">
                                <div className="flex flex-wrap gap-y-2 gap-x-4">
                                    {chemSymbols.map((group, idx) => (
                                        <div key={idx} className="flex flex-wrap gap-1">
                                            {group.symbols.map((sym) => (
                                                <button
                                                    key={sym}
                                                    type="button"
                                                    onClick={() => insertSymbol(sym)}
                                                    className="min-w-[2rem] h-8 px-1 flex items-center justify-center text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all active:scale-95 shadow-sm"
                                                    title={`Insertar ${sym}`}
                                                >
                                                    {sym}
                                                </button>
                                            ))}
                                            {idx < chemSymbols.length - 1 && (
                                                <div className="w-px bg-slate-300 dark:bg-slate-700 mx-1 self-center h-5" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={selectedImage ? "Añade instrucciones adicionales para la imagen (opcional)..." : "Ej: Calcula la integral de e^x... o cinética de reacción..."}
                        className="w-full min-h-[120px] p-4 pr-12 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans"
                        disabled={isSolving}
                    />
                    
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSolving}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ImagePlus className="w-4 h-4" />
                                <span>Subir Imagen</span>
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageSelect} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={(!prompt.trim() && !selectedImage) || isSolving}
                            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold text-white transition-all transform active:scale-95 ${
                                (!prompt.trim() && !selectedImage) || isSolving
                                    ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50'
                            }`}
                        >
                            {isSolving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Pensando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Resolver</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InputArea;