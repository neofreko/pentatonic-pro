# Pentatonic Pro: Technical Documentation

**Live Demo:** [https://neofreko.github.io/pentatonic-pro/](https://neofreko.github.io/pentatonic-pro/)

## 1. Project Overview
Pentatonic Pro is a specialized guitar pedagogy application designed to bridge the gap between abstract theory and fretboard muscle memory. It uses a combination of a deterministic music logic engine and a generative AI tutor (Gemini).

## 2. System Architecture

### Music Logic Engine (`utils/musicLogic.ts`)
- **Deterministic Theory**: The app does not "guess" notes. It uses a fixed array of 12 chromatic semitones (`NOTES`) and a 6-element `TUNING` array representing the guitar's open strings.
- **Scale Calculations**: Scales are defined as intervals (e.g., `[0, 3, 5, 7, 10]` for minor pentatonic). The logic checks if a note's distance from the `rootNote` matches one of these intervals.
- **Positioning**: Fretboard positions are calculated as `(OpenStringNote + Fret) % 12`.

### Audio Service & Sequencer (`services/backingTrackService.ts`)
- **Web Audio API**: Uses high-precision scheduling (Look-ahead pattern) to ensure rock-solid timing.
- **Amp Simulation**: Implements a sophisticated guitar signal chain including dual oscillators, asymmetric tube-style clipping, and a 4th-order cabinet simulation (based on JCM 800 models).
- **Backing Tracks**: Features a polyphonic sequencer for drums (Kick, Snare, Hi-hat), Bass, and Harmony (Triads/7th Chords).
- **Real-time Transposition**: Automatically transposes backing track progressions to match the user's selected `rootNote`.

### AI Integration (`services/aiService.ts`)
- **Primary Engine**: **OpenRouter** (supports Gemini 2.0 Flash, Claude 3, Llama 3.1, etc.).
- **Authentication**: Secure **PKCE (Proof Key for Code Exchange)** flow for user-based OpenRouter access.
- **Fallback**: Direct Google Gemini API integration as a secondary option.
- **Context Injection**: The service takes the current `Chapter` state (Title, Focus, Mission) and the current fretboard position to inject into the instructor prompt. This ensures the AI's explanation aligns with what the user sees.

## 3. Data Schema
The syllabus is defined in `data/chapters.ts` using the following interface:
- `Chapter`: Root object for a lesson.
- `TutorialStep`: Individual interactive tasks (e.g., "Find the Root").
- `Challenge`: The assessment module that gates progression.

## 4. Visual Language
- **Colors**: Slate-950 background for high contrast, Amber-500 for primary actions and Roots, Indigo-500 for challenges.
- **Fretboard**: 15 frets by default. Includes standard dot inlays at 3, 5, 7, 9, 12.

## 6. Credits & Acknowledgments

Pentatonic Pro incorporates logic and architectural patterns inspired by several open-source projects:

- **[Backing Tracks](https://github.com/ako/backing-tracks)**: The data-driven approach to backing tracks and the conceptual model for "Jam Mode" was inspired by this repository's BTML (Backing Track Markup Language).
- **[WebAudio Guitar Amplifier Simulator](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3)**: The high-gain synthesis engine, asymmetric distortion models, and 4th-order cabinet filtering were adapted from the sophisticated amp simulations developed by micbuffa.

## 7. Development
To run the project locally:
1. `bun install`
2. `bun run dev`
3. `bun test` to run the test suite.
