import { useState, useEffect, useRef, useCallback } from 'react';
import { freqToMidi, findNearestDegree, buildScaleChord, playMidiNote } from '../utils/musicTheory';

const HOLD_MS = 600;
const TIMEOUT_MS = 10000;
const ALL_DEGREES = new Set([0, 1, 2, 3, 4, 5, 6]);
const STABLE_FRAMES = 4;

export function useArpeggio(detectedFreq, scale, onAdvance) {
  const [chord, setChord] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [enabledDegrees, setEnabledDegrees] = useState(ALL_DEGREES);
  const [activeTone, setActiveTone] = useState(null);
  const [failedTones, setFailedTones] = useState(new Set());
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const pendingToneRef = useRef({ value: null, count: 0 });
  const onAdvanceRef = useRef(onAdvance);
  const chordRef = useRef(chord);
  useEffect(() => { onAdvanceRef.current = onAdvance; }, [onAdvance]);
  useEffect(() => { chordRef.current = chord; }, [chord]);

  // Reset when scale changes
  useEffect(() => {
    clearTimeout(timerRef.current);
    clearTimeout(timeoutRef.current);
    setChord(null);
    setCurrentIndex(0);
    setPhase('idle');
    setActiveTone(null);
    setFailedTones(new Set());
    pendingToneRef.current = { value: null, count: 0 };
  }, [scale.rootPc, scale.modeIndex]);

  // Stability buffer: accumulates per-frame, commits after STABLE_FRAMES
  useEffect(() => {
    const raw = (detectedFreq && chord)
      ? findNearestDegree(freqToMidi(detectedFreq), chord.notes).degree
      : null;

    if (raw === pendingToneRef.current.value) {
      pendingToneRef.current.count++;
    } else {
      pendingToneRef.current = { value: raw, count: 1 };
    }
    if (pendingToneRef.current.count === STABLE_FRAMES) {
      setActiveTone(raw);
    }
  }, [detectedFreq, chord]);

  // Hold-to-advance: correct tone held for HOLD_MS
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

  // 10-second deadline: mark failed, play the note, advance
  useEffect(() => {
    if (phase !== 'singing' || !chord) return;

    timeoutRef.current = setTimeout(() => {
      setFailedTones(prev => new Set([...prev, currentIndex]));
      playMidiNote(chordRef.current.notes[currentIndex]);
      const next = currentIndex + 1;
      if (next >= chordRef.current.notes.length) setPhase('done');
      else setCurrentIndex(next);
    }, TIMEOUT_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, phase, chord]);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearTimeout(timeoutRef.current);
  }, []);

  const newArpeggio = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(timeoutRef.current);
    const degrees = [...enabledDegrees];
    const deg = degrees[Math.floor(Math.random() * degrees.length)];
    setChord(buildScaleChord(scale, deg));
    setCurrentIndex(0);
    setPhase('singing');
    setActiveTone(null);
    setFailedTones(new Set());
    pendingToneRef.current = { value: null, count: 0 };
  }, [enabledDegrees, scale]);

  const stopArpeggio = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(timeoutRef.current);
    setChord(null);
    setCurrentIndex(0);
    setPhase('idle');
    setActiveTone(null);
    setFailedTones(new Set());
    pendingToneRef.current = { value: null, count: 0 };
  }, []);

  const toggleDegree = useCallback((deg) => {
    setEnabledDegrees(prev => {
      const next = new Set(prev);
      if (next.has(deg) && next.size > 1) next.delete(deg);
      else next.add(deg);
      return next;
    });
  }, []);

  return { chord, currentIndex, phase, activeTone, failedTones, enabledDegrees, toggleDegree, newArpeggio, stopArpeggio };
}
