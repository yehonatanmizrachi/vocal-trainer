import { useState, useEffect, useRef, useCallback } from 'react';
import { freqToMidi, findNearestDegree, buildScaleChord } from '../utils/musicTheory';

const HOLD_MS = 600;
const ALL_DEGREES = new Set([0, 1, 2, 3, 4, 5, 6]);
const STABLE_FRAMES = 4;

export function useArpeggio(detectedFreq, scale, onAdvance) {
  const [chord, setChord] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [enabledDegrees, setEnabledDegrees] = useState(ALL_DEGREES);
  const [activeTone, setActiveTone] = useState(null);
  const timerRef = useRef(null);
  const pendingToneRef = useRef({ value: null, count: 0 });
  const onAdvanceRef = useRef(onAdvance);
  useEffect(() => { onAdvanceRef.current = onAdvance; }, [onAdvance]);

  // Reset exercise whenever the scale changes
  useEffect(() => {
    clearTimeout(timerRef.current);
    setChord(null);
    setCurrentIndex(0);
    setPhase('idle');
    setActiveTone(null);
    pendingToneRef.current = { value: null, count: 0 };
  }, [scale.rootPc, scale.modeIndex]);

  // Runs every frame (detectedFreq changes at 60fps) and accumulates
  // a stability count; only commits to activeTone after STABLE_FRAMES
  // consecutive frames on the same tone so the card doesn't flicker.
  useEffect(() => {
    const raw = (detectedFreq && chord)
      ? findNearestDegree(freqToMidi(detectedFreq), chord.notes).degree
      : null;

    if (raw === pendingToneRef.current.value) {
      pendingToneRef.current.count++;
    } else {
      pendingToneRef.current = { value: raw, count: 1 };
    }
    // Fire setState only on the exact frame the threshold is first crossed
    if (pendingToneRef.current.count === STABLE_FRAMES) {
      setActiveTone(raw);
    }
  }, [detectedFreq, chord]);

  // Advance when the user holds the right chord tone for HOLD_MS
  useEffect(() => {
    if (phase !== 'singing' || !chord || activeTone !== currentIndex + 1) return;
    timerRef.current = setTimeout(() => {
      onAdvanceRef.current?.();
      const next = currentIndex + 1;
      if (next >= chord.notes.length) setPhase('done');
      else setCurrentIndex(next);
    }, HOLD_MS);
    return () => clearTimeout(timerRef.current);
  }, [activeTone, phase, chord, currentIndex]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const newArpeggio = useCallback(() => {
    clearTimeout(timerRef.current);
    const degrees = [...enabledDegrees];
    const deg = degrees[Math.floor(Math.random() * degrees.length)];
    setChord(buildScaleChord(scale, deg));
    setCurrentIndex(0);
    setPhase('singing');
    setActiveTone(null);
    pendingToneRef.current = { value: null, count: 0 };
  }, [enabledDegrees, scale]);

  const toggleDegree = useCallback((deg) => {
    setEnabledDegrees(prev => {
      const next = new Set(prev);
      if (next.has(deg) && next.size > 1) next.delete(deg);
      else next.add(deg);
      return next;
    });
  }, []);

  return { chord, currentIndex, phase, activeTone, enabledDegrees, toggleDegree, newArpeggio };
}
