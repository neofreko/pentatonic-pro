# Pentatonic Pro: Copilot Instructions

## Project Overview

Pentatonic Pro is a specialized guitar pedagogy application that bridges abstract theory and fretboard muscle memory. It combines a deterministic music logic engine with a generative AI tutor (Gemini) to teach guitar scales.

**Live Demo:** [https://neofreko.github.io/pentatonic-pro/](https://neofreko.github.io/pentatonic-pro/)

## Technology Stack

- **Framework:** React 19.2.3 with TypeScript
- **Build Tool:** Vite 6.2.0
- **Testing:** Vitest (tests exist but test infrastructure needs to be set up in package.json)
- **Package Manager:** npm or bun
- **AI Integration:** Google Gemini AI (@google/genai)
- **Icons:** Lucide React
- **Deployment:** GitHub Pages

## Architecture

### Core Components

1. **Music Logic Engine** (`utils/musicLogic.ts`)
   - Deterministic theory - does not "guess" notes
   - Uses 12 chromatic semitones array (NOTES)
   - 6-element TUNING array for guitar open strings
   - Scales defined as intervals (e.g., [0, 3, 5, 7, 10] for minor pentatonic)
   - Fretboard positions calculated as (OpenStringNote + Fret) % 12

2. **Audio Service** (`utils/audio.ts`)
   - Web Audio API implementation
   - Triangle Oscillator with Exponential Decay Envelope
   - Simulates guitar pluck without external assets

3. **AI Integration** (`services/geminiService.ts`)
   - Model: gemini-3-flash-preview
   - Context injection with Chapter state (Title, Focus, Mission)
   - Ensures AI explanations align with fretboard display

4. **Lesson System** (`services/lessonLoader.ts`)
   - Loads markdown lessons from public/lessons.md
   - Parses and structures lesson content

### Data Schema (types.ts)

- `Chapter`: Root object for a lesson
- `TutorialStep`: Individual interactive tasks (e.g., "Find the Root")
- `Challenge`: Assessment module that gates progression
- `ScaleType`: 'minor' | 'major'
- `FretPosition`: { string: number, fret: number }

## Development Commands

```bash
# Development server (runs on port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Note: Test scripts need to be added to package.json
# Test files exist in utils/ and hooks/ directories using Vitest
```

## Code Style & Conventions

### TypeScript

- Use strict TypeScript - no `any` types
- Define interfaces in `types.ts` for shared types
- Use path alias `@/` for imports (e.g., `import { Chapter } from '@/types'`)
- Target: ES2022
- JSX: react-jsx

### React Components

- Use functional components with hooks
- Place components in `components/` directory
- Component files use PascalCase.tsx naming
- Use TypeScript for all components
- Custom hooks in `hooks/` directory with `use` prefix

### Testing

- Test files use `.test.ts` or `.test.tsx` extension
- Place tests next to the code they test
- Use Vitest and @testing-library/jest-dom
- Follow TDD workflow documented in `.agent/workflows/tdd-solid.md`

### Visual Design

- **Colors:**
  - Background: Slate-950 (high contrast)
  - Primary actions & Roots: Amber-500
  - Challenges: Indigo-500
- **Fretboard:** 15 frets default, standard dot inlays at 3, 5, 7, 9, 12

## Environment Variables

- `GEMINI_API_KEY`: Required for AI tutor functionality
- Set in `.env` file (not committed)
- Accessed via `process.env.API_KEY` or `process.env.GEMINI_API_KEY` in code (both are defined in vite.config.ts)

## Project Structure

```
/
├── .agent/workflows/     # Agent workflow documentation
├── .github/             # GitHub configuration
├── components/          # React components
├── data/               # Static data (chapters.ts)
├── hooks/              # Custom React hooks
├── public/             # Static assets (lessons.md)
├── services/           # External services (AI, loaders)
├── utils/              # Utility functions (music logic, audio)
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── types.ts            # Shared TypeScript types
└── constants.ts        # App constants
```

## Adding New Features

### Adding a New Chapter

1. Define structure in `types.ts` if needed
2. Add new object to `CHAPTERS` array in `data/chapters.ts`
3. UI automatically detects and updates Syllabus sidebar

### Adding New Components

1. Create in `components/` directory
2. Use TypeScript with proper interfaces
3. Follow existing component patterns
4. Test thoroughly

### Adding New Utilities

1. Create in `utils/` directory
2. Include unit tests (`.test.ts` file)
3. Export functions explicitly
4. Document complex logic

## Testing Guidelines

- Test files exist using Vitest framework (`.test.ts` extension)
- Test setup file: `vitest-setup.ts` (imports @testing-library/jest-dom)
- **Note:** Test scripts need to be added to package.json to run tests
- Follow Test-Driven Development (TDD) cycle:
  1. **Red:** Write failing test first
  2. **Green:** Write minimum code to pass
  3. **Refactor:** Improve code while tests pass
- Apply SOLID principles during refactoring
- See `.agent/workflows/tdd-solid.md` for detailed workflow

## Important Notes

- The app uses deterministic music theory - never introduce randomness in note calculations
- Audio synthesis is done entirely in-browser with Web Audio API
- AI responses must be contextual to the current chapter's focus
- Maintain high contrast visuals for accessibility
- Keep the fretboard rendering performant (15 frets × 6 strings = 90 positions)

## References

- Technical documentation: `README.md`
- TDD workflow: `.agent/workflows/tdd-solid.md`
- Type definitions: `types.ts`
- Chapter data structure: `data/chapters.ts`
