import { GoogleGenAI, Type } from "@google/genai";
import { ScaleType, Chapter } from "../types";

export const getScaleLesson = async (
  rootNote: string, 
  scaleType: ScaleType, 
  chapter?: Chapter, 
  position?: number,
  mode: 'CURRICULUM' | 'PHRASING' = 'CURRICULUM',
  pattern?: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chapterContext = chapter && mode === 'CURRICULUM'
    ? `We are currently on Chapter: "${chapter.title}" focusing on ${chapter.focus}. Student mission: ${chapter.mission}.`
    : "";

  const labContext = mode === 'PHRASING'
    ? `The student is in the PHRASING LAB experimenting with ${pattern} patterns. Focus on rhythmic phrasing, pick-hand dynamics, and creative interval usage.`
    : "";

  const prompt = `Act as a world-class guitar instructor. 
  Explain the ${rootNote} ${scaleType} pentatonic scale.
  ${chapterContext}
  ${labContext}
  The student is currently viewing Position ${position || 1} of the scale box system.

  CRITICAL INSTRUCTION:
  ${mode === 'PHRASING' 
    ? `Provide a "Pro Tip" specifically for playing ${pattern} patterns. Explain how to resolve these patterns musically to the root or the 5th to avoid sounding like a "scale exercise".` 
    : `Explain the "SEQUENCES OF 3" (Triplets) logic for this position.`
  }
  
  Please:
  1. Provide a short, punchy insight (max 150 words).
  2. If in Phrasing Lab, suggest one "vocal-like" lick (string and fret numbers) for Position ${position || 1}.
  3. Keep the tone encouraging but highly technical.
  
  Format the response in clear Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The instructor is currently tuning their guitar. Keep experimenting with the patterns!";
  }
};