import { useState, useEffect, useRef, useCallback } from 'react';
import { generateExercise } from '../utils/musicTheory';

const HOLD_MS = 600;

export function useExercise(activeDegree) {
  const [sequence, setSequence] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'singing' | 'done'
  const timerRef = useRef(null);

  const newExercise = useCallback(() => {
    clearTimeout(timerRef.current);
    setSequence(generateExercise());
    setCurrentIndex(0);
    setPhase('singing');
  }, []);

  // Advance when the user holds the correct degree for HOLD_MS
  useEffect(() => {
    if (phase !== 'singing' || !sequence) return;
    const target = sequence[currentIndex];
    if (activeDegree !== target) return;

    timerRef.current = setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= sequence.length) {
        setPhase('done');
      } else {
        setCurrentIndex(next);
      }
    }, HOLD_MS);

    return () => clearTimeout(timerRef.current);
  }, [activeDegree, phase, sequence, currentIndex]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return { sequence, currentIndex, phase, newExercise };
}
