import React, { useState, useRef } from 'react';
import { Send, ImagePlus, X, Loader2 } from 'lucide-react';

interface InputAreaProps {
    onSolve: (text: string, image: File | null) => void;
    isSolving: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSolve, isSolving }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!prompt.trim() && !selectedImage) || isSolving) return;
        onSolve(prompt, selectedImage);
        setPrompt('');
        clearImage();
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
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={selectedImage ? "Añade instrucciones adicionales para la imagen (opcional)..." : "Escribe tu problema de química aquí. Sé tan detallado como necesites..."}
                        className="w-full min-h-[100px] p-4 pr-12 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
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