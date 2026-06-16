import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { freqToMidi, findNearestDegree, buildScaleChord } from '../utils/musicTheory';

const HOLD_MS = 600;
const ALL_DEGREES = new Set([0, 1, 2, 3, 4, 5, 6]);

export function useArpeggio(detectedFreq, scale) {
  const [chord, setChord] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [enabledDegrees, setEnabledDegrees] = useState(ALL_DEGREES);
  const timerRef = useRef(null);

  // Reset exercise whenever the scale changes
  useEffect(() => {
    clearTimeout(timerRef.current);
    setChord(null);
    setCurrentIndex(0);
    setPhase('idle');
  }, [scale.rootPc, scale.modeIndex]);

  // Convert raw frequency → discrete chord-tone index (1-based)
  const activeTone = useMemo(() => {
    if (!detectedFreq || !chord) return null;
    const { degree } = findNearestDegree(freqToMidi(detectedFreq), chord.notes);
    return degree;
  }, [detectedFreq, chord]);

  // Advance when the user holds the right chord tone for HOLD_MS
  useEffect(() => {
    if (phase !== 'singing' || !chord || activeTone !== currentIndex + 1) return;
    timerRef.current = setTimeout(() => {
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
