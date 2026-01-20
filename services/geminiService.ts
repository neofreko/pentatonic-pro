
import { ScaleType, Chapter } from "../types";

/**
 * Security Note: This service is disabled in production builds to prevent
 * API key exposure in the frontend code deployed to GitHub Pages.
 * 
 * AI-powered lessons are only available in local development with a valid API key.
 */

const AI_UNAVAILABLE_MESSAGE = `## AI Lessons Temporarily Unavailable

This feature requires a Gemini API integration that is not available in the public demo for security reasons.

**In the meantime, here are key concepts for practicing triplets:**

### Triplets on 2-Note-Per-String Scales

The pentatonic scale naturally lays out with 2 notes per string. When you play in groups of 3 (triplets), you create a rhythmic offset that's excellent for:

- **Pick-hand coordination**: Alternating between strings mid-triplet
- **Positional shifts**: Moving fluidly across the fretboard
- **Musical phrasing**: Breaking away from predictable patterns

### Pattern Breakdown

Each triplet group spans multiple strings:
- Notes 1-2-3: Start on one string, move to the next
- Notes 2-3-4: Overlap creates the "rolling" effect
- Notes 3-4-5: Continues the ascending pattern

### Picking Challenges

- **Inside Picking**: When you pick "between" the strings (down-up motion stays inside)
- **Outside Picking**: When you pick "around" the strings (requires wider motion)

**Practice tip**: Start slowly and maintain even rhythm. The triplet pattern will feel awkward at first—that's the training effect!`;

export const getScaleLesson = async (rootNote: string, scaleType: ScaleType, chapter?: Chapter, position?: number): Promise<string> => {
  // For security, API key integration is disabled in production builds
  // This prevents exposing API credentials in frontend JavaScript
  return AI_UNAVAILABLE_MESSAGE;
};
