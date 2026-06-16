import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

  // Raw tone detected this frame (changes at 60fps)
  const rawTone = useMemo(() => {
    if (!detectedFreq || !chord) return null;
    const { degree } = findNearestDegree(freqToMidi(detectedFreq), chord.notes);
    return degree;
  }, [detectedFreq, chord]);

  // Stabilise: only commit rawTone to activeTone after STABLE_FRAMES in a row
  useEffect(() => {
    if (rawTone === pendingToneRef.current.value) {
      pendingToneRef.current.count++;
    } else {
      pendingToneRef.current = { value: rawTone, count: 1 };
    }
    if (pendingToneRef.current.count >= STABLE_FRAMES) {
      setActiveTone(rawTone);
    }
  }, [rawTone]);

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
