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
The audio engine is the heart of the "Jam Mode" and backing track features. It bypasses pre-recorded audio files in favor of real-time synthesis, offering unlimited flexibility and extremely low bandwidth usage.

#### 1. High-Precision Scheduler
- **Look-ahead Pattern**: Uses the standard Web Audio scheduling technique. A `setTimeout` loop runs every 25ms to look 100ms into the future.
- **AudioContext Time**: Events are scheduled using `audioCtx.currentTime`, ensuring sample-accurate timing even if the main JS thread lags.
- **Polyphonic Sequencing**: Capable of scheduling multiple independent instrument lines (Drums, Bass, Harmony) simultaneously.

#### 2. Karplus-Strong Physical Modeling
To simulate realistic guitar tones, we replaced standard oscillators with the **Karplus-Strong algorithm**:
- **Excitation**: A burst of white noise is generated (simulating a pick striking a string).
- **Resonator**: This noise is fed into a feedback loop with a delay line equal to the pitch period.
- **Damping**: A Low-Pass filter in the loop simulates the string's natural high-frequency energy loss.
- **Result**: A mathematically generated sound that physically behaves like a plucked string, with dynamic decay and harmonic complexity.

#### 3. Amp & Cabinet Simulation
The raw string signal is processed through a chain modeled after a **Marshall JCM 800**:
- **Pre-Amp**: Multi-stage gain with envelope shaping. The signal is boosted *before* distortion, allowing for dynamic "clean up" based on input velocity.
- **Asymmetric Distortion**: Uses a custom WaveShaper curve that clips positive and negative cycles differently, mimicking the non-linear response of vacuum tubes.
- **Tonestack**: A 3-band EQ with a fixed mid-hump (~800Hz) characteristic of British amplifiers.
- **Cabinet Simulation**: A 4th-order filter chain (High Pass -> Notch -> Low Pass -> Low Pass) that emulates the frequency response of a 12-inch Celestion speaker, rolling off harsh digital fizz above 4kHz.

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
