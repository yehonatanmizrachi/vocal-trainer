# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build
npm run preview   # serve the production build locally
```

No test suite or linter configured.

## Architecture

React 18 + Vite 5 single-page app. No routing — one `App.jsx` with three tabs: Scale Exercise (default), Arpeggio, and Free Practice.

### Data flow

`App.jsx` is the single state owner. It wires together four hooks and passes derived values down to presentational components:

- **`useScale`** — current root note + mode (7 church modes). Produces a `scale` object with `notes` (7 MIDI numbers anchored at middle C) and metadata.
- **`usePitchDetection(scaleNotes)`** — runs a `requestAnimationFrame` loop using the Web Audio API + `pitchy` (McLeod pitch detector). Emits `activeDegree` (1–7, committed only after 4 stable frames at ≥85% clarity) and raw freq/cents data.
- **`useExercise(activeDegree, scaleNotes, onAdvance)`** — generates a random 6-degree sequence; advances when the singer holds the correct degree for 600ms; auto-fails and plays the note after 10s.
- **`useArpeggio(detectedFreq, scale, onAdvance)`** — same hold/timeout mechanic but for chord tones. Picks a random chord from the enabled scale degrees; matches pitch against chord notes (not scale degrees).

### Mic management

`App.jsx` has a single `useEffect` that is the source of truth for the mic:
- **On** during Free Practice tab, or while `phase === 'singing'` in exercise/arpeggio tabs.
- **Off** otherwise (idle, done states, and when on a different tab).

Switching tabs calls `stopExercise` / `stopArpeggio` on the departing tab.

### Key utilities (`src/utils/musicTheory.js`)

`buildScale(rootPc, modeIndex)` → scale object used everywhere. `findNearestDegree(detectedMidi, scaleNotes)` handles multi-octave matching with 80-cent tolerance. `playMidiNote(midi)` synthesises a sine tone via Web Audio for failure feedback. `generateExercise()` produces the random 6-note sequence.

### Phase state machine (shared by both exercise hooks)

`idle` → (start) → `singing` → (all notes complete) → `done` → (next) → `singing`  
Any tab switch or explicit stop returns to `idle`.
