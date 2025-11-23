import React from 'react';
import { History, Trash2, ChevronRight, Clock } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClear: () => void;
    isOpen: boolean;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-700">
                    <History className="w-5 h-5" />
                    <h3 className="font-bold">Historial</h3>
                </div>
                {history.length > 0 && (
                    <button 
                        onClick={onClear}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50"
                    >
                        <Trash2 className="w-3 h-3" />
                        <span>Borrar</span>
                    </button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                    <div className="text-center text-slate-400 mt-10">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Aún no hay problemas resueltos.</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className="group p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-slate-400">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                                {item.imagePreview && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">IMG</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-snug">
                                {item.question || "Problema con imagen..."}
                            </p>
                            <div className="mt-2 flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                                <span>Ver solución</span>
                                <ChevronRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistorySidebar;
