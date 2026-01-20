# Pentatonic Pro: Technical Documentation

**Live Demo:** [https://neofreko.github.io/pentatonic-pro/](https://neofreko.github.io/pentatonic-pro/)

## 1. Project Overview
Pentatonic Pro is a specialized guitar pedagogy application designed to bridge the gap between abstract theory and fretboard muscle memory. It uses a combination of a deterministic music logic engine and a generative AI tutor (Gemini).

## 2. System Architecture

### Music Logic Engine (`utils/musicLogic.ts`)
- **Deterministic Theory**: The app does not "guess" notes. It uses a fixed array of 12 chromatic semitones (`NOTES`) and a 6-element `TUNING` array representing the guitar's open strings.
- **Scale Calculations**: Scales are defined as intervals (e.g., `[0, 3, 5, 7, 10]` for minor pentatonic). The logic checks if a note's distance from the `rootNote` matches one of these intervals.
- **Positioning**: Fretboard positions are calculated as `(OpenStringNote + Fret) % 12`.

### Audio Service (`utils/audio.ts`)
- Uses the **Web Audio API**.
- Implements a basic synthesis engine (Triangle Oscillator with an Exponential Decay Envelope) to simulate a guitar pluck without external assets.

### AI Integration (`services/geminiService.ts`)
- **Model**: `gemini-3-flash-preview` for high-speed instructional generation.
- **Context Injection**: The service takes the current `Chapter` state (Title, Focus, Mission) and injects it into the prompt. This ensures the AI's explanation aligns with what the user sees on the fretboard.

## 3. Data Schema
The syllabus is defined in `data/chapters.ts` using the following interface:
- `Chapter`: Root object for a lesson.
- `TutorialStep`: Individual interactive tasks (e.g., "Find the Root").
- `Challenge`: The assessment module that gates progression.

## 4. Visual Language
- **Colors**: Slate-950 background for high contrast, Amber-500 for primary actions and Roots, Indigo-500 for challenges.
- **Fretboard**: 15 frets by default. Includes standard dot inlays at 3, 5, 7, 9, 12.

## 5. Maintenance
To add a new chapter:
1. Define the structure in `types.ts`.
2. Add a new object to the `CHAPTERS` array in `data/chapters.ts`.
3. The UI will automatically detect the new chapter and update the Syllabus sidebar.

## 6. Development & Deployment

### PR Preview Deployments
This repository is configured to automatically deploy PR previews to GitHub Pages:
- **Automatic**: Every pull request gets its own preview deployment
- **URL Format**: `https://neofreko.github.io/pentatonic-pro/pr-{number}/`
- **Updates**: Previews update automatically when you push new changes
- **Cleanup**: Previews are automatically removed when PRs are closed or merged

When you open a PR, the GitHub Actions bot will comment with the preview URL, making it easy for reviewers to test changes before merging.

### Main Deployment
The main production deployment happens automatically when changes are merged to the `main` branch and is available at: [https://neofreko.github.io/pentatonic-pro/](https://neofreko.github.io/pentatonic-pro/)
