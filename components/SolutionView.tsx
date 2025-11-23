import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { BookOpen, Copy, Check, RotateCcw, Volume2, Square, Loader2 } from 'lucide-react';
import { generateVoiceExplanation } from '../services/geminiService';

interface SolutionViewProps {
    markdown: string;
    onReset: () => void;
}

// Utility to decode base64 string
function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const SolutionView: React.FC<SolutionViewProps> = ({ markdown, onReset }) => {
    const [copied, setCopied] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    // Cache audio to avoid re-generating for the same result
    const [cachedAudioBuffer, setCachedAudioBuffer] = useState<AudioBuffer | null>(null);

    useEffect(() => {
        // Cleanup audio on unmount or when markdown changes
        return () => {
            if (audioSourceRef.current) {
                try {
                    audioSourceRef.current.stop();
                } catch(e) {}
            }
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, [markdown]); // Reset audio if the solution changes

    const handleCopy = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stopAudio = () => {
        if (audioSourceRef.current) {
            try {
                audioSourceRef.current.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    };

    const playAudioBuffer = async (buffer: AudioBuffer, ctx: AudioContext) => {
        // Stop any currently playing audio
        if (audioSourceRef.current) {
            try {
                audioSourceRef.current.stop();
            } catch (e) {}
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
            setIsPlaying(false);
            audioSourceRef.current = null;
        };

        audioSourceRef.current = source;
        source.start(0);
        setIsPlaying(true);
    };

    const handleReadAloud = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        setIsLoadingAudio(true);

        try {
            // Initialize AudioContext if needed
            let ctx = audioContext;
            if (!ctx || ctx.state === 'closed') {
                const NewAudioContext = window.AudioContext || (window as any).webkitAudioContext;
                ctx = new NewAudioContext({ sampleRate: 24000 }); // Gemini TTS is 24kHz
                setAudioContext(ctx);
            }
            
            // Resume context if suspended (browser policy)
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            // Use cached buffer if available
            if (cachedAudioBuffer) {
                await playAudioBuffer(cachedAudioBuffer, ctx);
                setIsLoadingAudio(false);
                return;
            }

            // Fetch new audio
            const base64Audio = await generateVoiceExplanation(markdown);
            
            // Decode
            const audioBytes = decodeBase64(base64Audio);
            
            // Convert raw PCM to AudioBuffer
            // Note: Gemini sends raw PCM (Int16 usually). We need to convert Int16 to Float32 for Web Audio API.
            const dataInt16 = new Int16Array(audioBytes.buffer);
            const channelCount = 1;
            const sampleRate = 24000;
            const frameCount = dataInt16.length;
            
            const buffer = ctx.createBuffer(channelCount, frameCount, sampleRate);
            const channelData = buffer.getChannelData(0);
            
            for (let i = 0; i < frameCount; i++) {
                // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
                channelData[i] = dataInt16[i] / 32768.0;
            }

            setCachedAudioBuffer(buffer);
            await playAudioBuffer(buffer, ctx);

        } catch (error) {
            console.error("Error playing audio:", error);
            alert("Hubo un error al intentar reproducir el audio.");
        } finally {
            setIsLoadingAudio(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up transition-colors duration-300">
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                    <h2 className="font-bold text-lg">Resolución Detallada</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleReadAloud}
                        disabled={isLoadingAudio}
                        className={`p-2 rounded-lg transition-colors flex items-center space-x-2 ${
                            isPlaying 
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800'
                        }`}
                        title={isPlaying ? "Detener narración" : "Leer resolución en voz alta"}
                    >
                        {isLoadingAudio ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isPlaying ? (
                            <>
                                <Square className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium hidden sm:inline">Detener</span>
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-5 h-5" />
                                <span className="text-sm font-medium hidden sm:inline">Escuchar</span>
                            </>
                        )}
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <button
                        onClick={handleCopy}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Copiar solución"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            
            <div className="p-6 sm:p-8 overflow-x-auto">
                <div className="markdown-content text-slate-800 dark:text-slate-200">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl border-b pb-2 border-slate-200 dark:border-slate-700 text-indigo-900 dark:text-indigo-300" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl text-indigo-800 dark:text-indigo-400 mt-6 mb-3" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded" {...props} />,
                            code: ({node, className, children, ...props}) => {
                                const match = /language-(\w+)/.exec(className || '')
                                return !className ? (
                                  <code className="bg-slate-100 dark:bg-slate-900 text-pink-600 dark:text-pink-400 px-1 py-0.5 rounded text-sm font-mono border border-slate-200 dark:border-slate-700" {...props}>
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

            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 flex justify-center">
                <button
                    onClick={onReset}
                    className="flex items-center space-x-2 px-8 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl shadow-sm hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all transform active:scale-95"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span>Resolver otro problema</span>
                </button>
            </div>
        </div>
    );
};

export default SolutionView;