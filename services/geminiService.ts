import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres el "Profesor QuimicAI", un experto mundial en química y pedagogía científica. Tu objetivo es resolver cualquier problema de química, desde nivel escolar hasta nivel universitario avanzado (cinética, termodinámica, cuántica, orgánica, etc.).

Sigue ESTRICTAMENTE este formato de respuesta en Markdown:

# 🧪 Análisis del Problema
(Breve descripción del tipo de problema y conceptos clave involucrados)

## 📊 Datos Identificados
* Lista de variables conocidas con sus unidades.
* Lista de incógnitas.

## ⚗️ Principios y Fórmulas
* Leyes químicas aplicables.
* Fórmulas matemáticas en formato LaTeX (usa signos de dólar simple $ para inline y doble $$ para bloque).

## 📝 Resolución Paso a Paso
(Desarrollo detallado. Explica CADA paso lógico y matemático. No saltes pasos. Muestra conversiones de unidades explícitamente).

## 💡 Resultado Final
(Destaca la respuesta final claramente. Usa negritas o recuadros).

## 🧠 Explicación Conceptual
(¿Por qué sucede esto? Explica el fenómeno químico subyacente para que el estudiante aprenda, no solo copie).

IMPORTANTE:
- Usa sintaxis LaTeX para todas las ecuaciones químicas y matemáticas. Ejemplo: $H_2O$, $\Delta G = \Delta H - T\Delta S$.
- Si el usuario sube una imagen, extrae todo el texto y contexto visual cuidadosamente antes de resolver.
- Sé didáctico, amable y riguroso.
- Si el problema es ambiguo, asume las condiciones estándar (STP) o los valores más comunes, pero indícalo.
`;

export const solveChemistryProblem = async (
    prompt: string, 
    imageBase64?: string, 
    mimeType: string = 'image/jpeg'
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Use gemini-3-pro-preview for complex reasoning capabilities suited for STEM
        const modelName = 'gemini-3-pro-preview';
        
        let contents;

        if (imageBase64) {
             contents = {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: prompt || "Analiza esta imagen y resuelve el problema de química que aparece en ella con todo detalle."
                    }
                ]
            };
        } else {
            contents = {
                parts: [{ text: prompt }]
            };
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                // Using Thinking Config for deeper reasoning on complex problems
                thinkingConfig: { thinkingBudget: 16000 }, 
                temperature: 0.2, // Low temperature for precision in science
            }
        });

        return response.text || "No se pudo generar una respuesta detallada. Por favor intenta de nuevo.";

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        throw new Error(error.message || "Error al conectar con el servicio de IA.");
    }
};

export const generateVoiceExplanation = async (text: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Clean markdown slightly for better speech parsing (optional, but helpful for TTS context)
        const cleanText = `Por favor, lee la siguiente explicación química en voz alta para un estudiante, en español.
        Ignora los símbolos de formato Markdown como almohadillas o asteriscos.
        Lee las fórmulas químicas de forma natural y comprensible.
        
        Texto a leer:
        ${text.substring(0, 4000)}...`; // Limit text length to avoid token limits on TTS if solution is massive

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Puck' }, // 'Puck' works well for neutral/educational tone
                    },
                },
            },
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!audioData) {
            throw new Error("No se generó audio.");
        }

        return audioData;

    } catch (error: any) {
        console.error("Error generating speech:", error);
        throw new Error("No se pudo generar el audio de la explicación.");
    }
};