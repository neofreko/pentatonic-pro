import { GoogleGenAI } from "@google/genai";
import { ScaleType, Chapter } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const getScaleLesson = async (rootNote: string, scaleType: ScaleType, chapter?: Chapter, position?: number) => {
  const openRouterKey = localStorage.getItem('openrouter_api_key') || process.env.OPENROUTER_API_KEY || (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
  let openRouterModel = localStorage.getItem('openrouter_model') || process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

  // Immediate migration for deprecated models in code logic
  if (openRouterModel === 'google/gemini-flash-1.5') openRouterModel = 'google/gemini-2.0-flash-001';
  if (openRouterModel === 'google/gemini-pro-1.5') openRouterModel = 'google/gemini-2.5-pro';

  const geminiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

  const chapterContext = chapter
    ? `We are currently on Chapter: "${chapter.title}"
       Focus: ${chapter.focus}
       Mission: ${chapter.mission}`
    : "";

  const positionContext = position
    ? `The student is currently viewing Position ${position} of the scale box system.`
    : "";

  const scaleContext = scaleType === 'chromatic'
    ? `The student is exploring the full chromatic fretboard to understand distances (whole/half steps).`
    : `The student is learning the ${rootNote} ${scaleType} Pentatonic scale.`;

  const prompt = `Act as a world-class guitar instructor/music theorist.
  
  CONTEXT:
  - ${scaleContext}
  - ${chapterContext}
  - ${positionContext}

  YOUR TASK:
  1. Write a clear, engaging theory lesson (around 200-300 words) that directly addresses the current mission and focus.
  2. ALWAYS clarify terminology: Explain that "Up" on the fretboard means towards the body (higher fret numbers/higher pitch) and "Down" means towards the headstock (lower frets/lower pitch). This is a common point of confusion for beginners.
  3. If the scale is Pentatonic, include tips on phrasing or common shapes.
  4. If the scale is Chromatic/Geometry focus, explain the physical distance on the fretboard (frets) and how that translates to Western harmony (Half Steps vs Whole Steps).
  5. Include a small section called "Instructor's Tip" with a practical physical exercise or a visualization trick.
  6. Use professional tone but keep it accessible for a modern student.
  
  Format the response in clean Markdown. Avoid using excessive bolding or jargon without explanation.`;

  // Try OpenRouter first if key is available
  if (openRouterKey) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://pentatonic-pro.pages.dev",
          "X-Title": "Pentatonic Pro",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": openRouterModel,
          "messages": [
            { "role": "user", "content": prompt }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      } else if (data.error) {
        console.error("OpenRouter Error Object:", data.error);
        if (data.error.code === 401) throw new Error("Invalid API Key");
        throw new Error(data.error.message || "OpenRouter API error");
      }
    } catch (error: any) {
      console.error("OpenRouter API Error:", error);
      if (error.message === "Invalid API Key") return "Error: Invalid OpenRouter API Key. Please check your settings.";
      // Fall through to Gemini if enabled
    }
  }

  // Fallback to Gemini
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
    }
  }

  if (!openRouterKey && !geminiKey) {
    return "Please set your OpenRouter API key in settings to get personalized AI lessons!";
  }

  return "I couldn't fetch a tailored lesson right now. Use the visualizer to explore the fretboard nodes and intervals!";
};

export const testOpenRouterConnection = async (apiKey: string, model: string) => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://pentatonic-pro.pages.dev",
        "X-Title": "Pentatonic Pro",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          { "role": "user", "content": "Say 'Connection Successful!'" }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return { success: true, message: data.choices[0].message.content };
    } else {
      return { success: false, message: data.error?.message || "Connection failed" };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
