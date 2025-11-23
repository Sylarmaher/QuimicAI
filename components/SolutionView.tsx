import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BookOpen, Copy, Check, RotateCcw } from 'lucide-react';

interface SolutionViewProps {
    markdown: string;
    onReset: () => void;
}

const SolutionView: React.FC<SolutionViewProps> = ({ markdown, onReset }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-700">
                    <BookOpen className="w-5 h-5" />
                    <h2 className="font-bold text-lg">Resolución Detallada</h2>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Copiar solución"
                >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-x-auto">
                <div className="markdown-content text-slate-800">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl border-b pb-2 border-slate-200 text-indigo-900" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl text-indigo-800 mt-6 mb-3" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 bg-indigo-50 px-1 rounded" {...props} />,
                            code: ({node, className, children, ...props}) => {
                                const match = /language-(\w+)/.exec(className || '')
                                return !className ? (
                                  <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                            }
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-center">
                <button
                    onClick={onReset}
                    className="flex items-center space-x-2 px-8 py-3 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl shadow-sm hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all transform active:scale-95"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span>Resolver otro problema</span>
                </button>
            </div>
        </div>
    );
};

export default SolutionView;