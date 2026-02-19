import { ScaleType, Chapter } from "../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Generic helper to call OpenRouter API.
 * This decouples the app from any specific AI provider SDK.
 */
const callOpenRouter = async (prompt: string, userModel?: string) => {
  const apiKey = localStorage.getItem('openrouter_api_key') || process.env.OPENROUTER_API_KEY || (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
  const model = userModel || localStorage.getItem('openrouter_model') || "google/gemini-2.0-flash-001";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY_MISSING");
  }

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
        { "role": "user", "content": prompt }
      ]
    })
  });

  const data = await response.json();

  if (data.error) {
    console.error("OpenRouter Error:", data.error);
    throw new Error(data.error.message || "OpenRouter API error");
  }

  return data.choices?.[0]?.message?.content || "";
};

export const getScaleLesson = async (
  rootNote: string, 
  scaleType: ScaleType, 
  chapter?: Chapter, 
  position?: number, 
  userQuery?: string,
  mode: 'CURRICULUM' | 'PHRASING' = 'CURRICULUM',
  pattern?: string
) => {
  const chapterContext = chapter && mode === 'CURRICULUM'
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

  const labContext = mode === 'PHRASING'
    ? `The student is in the PHRASING LAB experimenting with ${pattern} patterns. Focus on rhythmic phrasing, pick-hand dynamics, and creative interval usage.`
    : "";

  const userQueryContext = userQuery 
    ? `The student has a specific question/request: "${userQuery}"`
    : "The student wants a standard lesson for this chapter.";

  const prompt = `Act as a world-class guitar instructor/music theorist.
  
  CONTEXT:
  - ${scaleContext}
  - ${chapterContext}
  - ${positionContext}
  - ${labContext}
  - ${userQueryContext}

  YOUR TASK:
  1. Write a clear, engaging theory lesson (around 200-300 words) that directly addresses the current mission or lab focus.
  2. If the student has a specific query (provided above), prioritize answering that query.
  3. ALWAYS clarify terminology: "Up" means towards the body (higher pitch), "Down" means towards headstock.
  4. Include tips on phrasing or common shapes.
  5. Include a section called "Instructor's Tip" with a practical physical exercise.
  
  CRITICAL FOR PHRASING MODE:
  ${mode === 'PHRASING' 
    ? `Provide a "Pro Tip" specifically for playing ${pattern} patterns. Explain how to resolve these patterns musically to the root or the 5th to avoid sounding like a "scale exercise".` 
    : ""
  }

  Format the response in clean Markdown.`;

  try {
    return await callOpenRouter(prompt);
  } catch (error: any) {
    if (error.message === "OPENROUTER_API_KEY_MISSING") {
      return "Please set your OpenRouter API key in settings to get personalized AI lessons!";
    }
    return `AI Error: ${error.message}`;
  }
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

export const getJamTip = async (rootNote: string, scaleType: ScaleType) => {
  const prompt = `You are a high-energy, fun guitar coach in a "Jam Session" mode.
  
  CONTEXT:
  - Key: ${rootNote} ${scaleType} Pentatonic
  - Student Level: Beginner/Intermediate (knows Box 1, Blue Note, and basic phrasing)

  YOUR TASK:
  Give me ONE short, creative "Micro-Challenge" to help me noodle/improvise.
  
  EXAMPLES OF GOOD TIPS:
  - "Play the Root, then slide up to the Blue Note and wiggle it!"
  - "Try a 'Call and Response': Play a loud lick, then whisper the same lick."
  - "Only play on the top 2 strings for the next 30 seconds. Go!"
  - "Hit the b7 and bend it slightly towards the Root. Make it cry!"
  
  Keep it under 30 words. Make it sound exciting! Use emojis 🎸🔥`;

  try {
    return await callOpenRouter(prompt);
  } catch (e) {
    console.error(e);
    return "Try playing a rhythmic motif: Long-Short-Short-Long!";
  }
};
