
import { GoogleGenAI, Type } from "@google/genai";
import { ScaleType, Chapter } from "../types";

export const getScaleLesson = async (rootNote: string, scaleType: ScaleType, chapter?: Chapter, position?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chapterContext = chapter 
    ? `We are currently on Chapter: "${chapter.title}" focusing on ${chapter.focus}. Student mission: ${chapter.mission}.`
    : "";

  const positionContext = position 
    ? `The student is currently viewing Position ${position} of the scale box system (CAGED-style).`
    : "";

  const prompt = `Act as a world-class guitar instructor. 
  Explain the ${rootNote} ${scaleType} pentatonic scale.
  ${chapterContext}
  ${positionContext}

  CRITICAL INSTRUCTION:
  The student is practicing "SEQUENCES OF 3" (Triplets) within a "2-NOTE PER STRING" scale structure.
  
  Please:
  1. Explain that because the Pentatonic scale is naturally "2-notes per string", playing in "groups of 3" creates a rhythmic offset that is excellent for developing pick-hand coordination.
  2. Describe how this specific pattern (Root-3rd-4th, 3rd-4th-5th, etc.) works up the strings from Low E to High E.
  3. Provide a clear text-based tab showing the first 3 groups (9 notes total) for Position ${position}.
  4. Give a specific tip on "Inside Picking" vs "Outside Picking" challenges that occur when playing 3-note groups on a 2-note-per-string scale.
  
  Format the response in clear Markdown. Keep it professional and encouraging.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I couldn't fetch a lesson right now. Keep practicing those triplets!";
  }
};
