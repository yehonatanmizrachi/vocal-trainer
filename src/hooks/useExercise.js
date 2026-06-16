import { useState, useEffect, useRef, useCallback } from 'react';
import { generateExercise, playMidiNote } from '../utils/musicTheory';

const HOLD_MS = 600;
const TIMEOUT_MS = 10000;

export function useExercise(activeDegree, scaleNotes, onAdvance) {
  const [sequence, setSequence] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [failedIndices, setFailedIndices] = useState(new Set());
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const onAdvanceRef = useRef(onAdvance);
  const scaleNotesRef = useRef(scaleNotes);
  useEffect(() => { onAdvanceRef.current = onAdvance; }, [onAdvance]);
  useEffect(() => { scaleNotesRef.current = scaleNotes; }, [scaleNotes]);

  const newExercise = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(timeoutRef.current);
    setSequence(generateExercise());
    setCurrentIndex(0);
    setPhase('singing');
    setFailedIndices(new Set());
  }, []);

  const stopExercise = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(timeoutRef.current);
    setSequence(null);
    setCurrentIndex(0);
    setPhase('idle');
    setFailedIndices(new Set());
  }, []);

  // Hold-to-advance: correct note held for HOLD_MS
  useEffect(() => {
    if (phase !== 'singing' || !sequence) return;
    const target = sequence[currentIndex];
    if (activeDegree !== target) return;

    timerRef.current = setTimeout(() => {
      onAdvanceRef.current?.();
      const next = currentIndex + 1;
      if (next >= sequence.length) setPhase('done');
      else setCurrentIndex(next);
    }, HOLD_MS);

    return () => clearTimeout(timerRef.current);
  }, [activeDegree, phase, sequence, currentIndex]);

  // 10-second deadline: mark failed, play the note, advance
  useEffect(() => {
    if (phase !== 'singing' || !sequence) return;

    timeoutRef.current = setTimeout(() => {
      const target = sequence[currentIndex];
      setFailedIndices(prev => new Set([...prev, currentIndex]));
      const midi = scaleNotesRef.current?.[target - 1];
      if (midi) playMidiNote(midi);
      const next = currentIndex + 1;
      if (next >= sequence.length) setPhase('done');
      else setCurrentIndex(next);
    }, TIMEOUT_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, phase, sequence]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return { sequence, currentIndex, phase, failedIndices, newExercise, stopExercise };
}
