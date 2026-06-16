import { useState, useCallback } from 'react';
import { buildScale, midiToFreq, MODES } from '../utils/musicTheory';

function playRootTone(rootMidi) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = midiToFreq(rootMidi);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.4, ctx.currentTime + 1.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.0);
    osc.onended = () => ctx.close();
  } catch {
    // Silently ignore if AudioContext is blocked
  }
}

function randomIndices() {
  return {
    rootPc: Math.floor(Math.random() * 12),
    modeIndex: Math.floor(Math.random() * MODES.length),
  };
}

export function useScale() {
  const [{ rootPc, modeIndex }, setIndices] = useState(() => randomIndices());
  const scale = buildScale(rootPc, modeIndex);

  const setRootPc = useCallback((pc) => {
    setIndices(prev => ({ ...prev, rootPc: pc }));
    playRootTone(60 + pc);
  }, []);

  const setModeIndex = useCallback((mi) => {
    setIndices(prev => ({ ...prev, modeIndex: mi }));
  }, []);

  const randomize = useCallback(() => {
    const next = randomIndices();
    setIndices(next);
    playRootTone(60 + next.rootPc);
  }, []);

  const playRoot = useCallback(() => {
    playRootTone(scale.rootMidi);
  }, [scale.rootMidi]);

  return { scale, setRootPc, setModeIndex, randomize, playRoot };
}
