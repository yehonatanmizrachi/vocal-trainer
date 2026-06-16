import { useState, useRef, useEffect, useCallback } from 'react';
import { PitchDetector } from 'pitchy';
import { freqToMidi, midiToNoteName, findNearestDegree } from '../utils/musicTheory';

const BUFFER_SIZE = 2048;
const CLARITY_THRESHOLD = 0.85;
const MIN_FREQ = 70;
const MAX_FREQ = 1200;
const STABLE_FRAMES = 4; // frames a degree must hold before committing (~67ms at 60fps)

export function usePitchDetection(scaleNotes) {
  const [state, setState] = useState({
    isListening: false,
    detectedNote: null,
    detectedFreq: null,
    detectedMidi: null,
    cents: null,
    activeDegree: null,
  });

  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const detectorRef = useRef(null);
  const scaleNotesRef = useRef(scaleNotes);
  const pendingDegRef = useRef({ value: null, count: 0 });

  useEffect(() => {
    scaleNotesRef.current = scaleNotes;
  }, [scaleNotes]);

  const stopListening = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    detectorRef.current = null;
    pendingDegRef.current = { value: null, count: 0 };
    setState({ isListening: false, detectedNote: null, detectedFreq: null, detectedMidi: null, cents: null, activeDegree: null });
  }, []);

  const startListening = useCallback(async () => {
    if (streamRef.current) return; // already listening
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = BUFFER_SIZE;
      source.connect(analyser);
      analyserRef.current = analyser;

      detectorRef.current = PitchDetector.forFloat32Array(BUFFER_SIZE);

      const buffer = new Float32Array(BUFFER_SIZE);

      function loop() {
        analyserRef.current.getFloatTimeDomainData(buffer);
        const [freq, clarity] = detectorRef.current.findPitch(buffer, ctx.sampleRate);

        if (clarity > CLARITY_THRESHOLD && freq > MIN_FREQ && freq < MAX_FREQ) {
          const midiFloat = freqToMidi(freq);
          const noteName = midiToNoteName(Math.round(midiFloat));
          const { degree, cents } = findNearestDegree(midiFloat, scaleNotesRef.current);

          // Accumulate stability: only commit when same degree holds for STABLE_FRAMES
          if (degree === pendingDegRef.current.value) {
            pendingDegRef.current.count++;
          } else {
            pendingDegRef.current = { value: degree, count: 1 };
          }
          const stable = pendingDegRef.current.count >= STABLE_FRAMES;

          setState(prev => ({
            isListening: true,
            detectedNote: noteName,
            detectedFreq: Math.round(freq),
            detectedMidi: midiFloat,
            cents: Math.round(cents),
            activeDegree: stable ? degree : prev.activeDegree,
          }));
        } else {
          if (null === pendingDegRef.current.value) {
            pendingDegRef.current.count++;
          } else {
            pendingDegRef.current = { value: null, count: 1 };
          }
          const stable = pendingDegRef.current.count >= STABLE_FRAMES;

          setState(prev => ({
            ...prev,
            isListening: true,
            detectedNote: null,
            detectedFreq: null,
            detectedMidi: null,
            cents: null,
            activeDegree: stable ? null : prev.activeDegree,
          }));
        }

        rafRef.current = requestAnimationFrame(loop);
      }

      setState(prev => ({ ...prev, isListening: true }));
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.error('Microphone error:', err);
    }
  }, []);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return { ...state, startListening, stopListening };
}
