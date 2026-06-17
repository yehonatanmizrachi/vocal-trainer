import { useState, useCallback, useEffect } from 'react';
import { getScaleChords } from './utils/musicTheory';
import { useScale } from './hooks/useScale';
import { usePitchDetection } from './hooks/usePitchDetection';
import { useExercise } from './hooks/useExercise';
import { useArpeggio } from './hooks/useArpeggio';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ScaleHeader } from './components/ScaleHeader';
import { ScalePicker } from './components/ScalePicker';
import { ScaleDegrees } from './components/ScaleDegrees';
import { Exercise } from './components/Exercise';
import { ArpeggioExercise, ChordSelector } from './components/ArpeggioExercise';
import { PitchDisplay } from './components/PitchDisplay';
import './App.css';

function playCoinSound() {
  const ctx = new AudioContext();
  [[659, 0], [988, 0.09]].forEach(([freq, delay]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.start(t);
    osc.stop(t + 0.15);
  });
  setTimeout(() => ctx.close(), 600);
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [tab, setTab] = useState('exercise');
  const [coins, setCoins] = useState(0);

  const { scale, setRootPc, setModeIndex, randomize, playRoot } = useScale();

  const {
    isListening, detectedNote, detectedFreq, detectedMidi,
    cents, activeDegree, startListening, stopListening,
  } = usePitchDetection(scale.notes);

  const onAdvance = useCallback(() => {
    setCoins(c => c + 1);
    playCoinSound();
  }, []);

  const { sequence, currentIndex: exIndex, phase: exPhase, failedIndices, newExercise, stopExercise } =
    useExercise(activeDegree, scale.notes, tab === 'exercise' ? onAdvance : null);

  const scaleChords = getScaleChords(scale);

  const {
    chord, currentIndex: arpIndex, phase: arpPhase, activeTone, failedTones,
    enabledDegrees, toggleDegree, newArpeggio, stopArpeggio,
  } = useArpeggio(detectedFreq, scale, tab === 'arpeggio' ? onAdvance : null);

  const handleTabChange = (t) => {
    if (t !== 'exercise') stopExercise();
    if (t !== 'arpeggio') stopArpeggio();
    setTab(t);
  };

  // Single source of truth for mic state:
  // on during Free Practice, on while an exercise is actively singing, off otherwise.
  useEffect(() => {
    if (showWelcome) return;
    const shouldListen =
      tab === 'practice' ||
      (tab === 'exercise'  && exPhase  === 'singing') ||
      (tab === 'arpeggio'  && arpPhase === 'singing');

    if (shouldListen) startListening();
    else stopListening();
  }, [showWelcome, tab, exPhase, arpPhase, startListening, stopListening]);

  if (showWelcome) {
    return <WelcomeScreen onBegin={() => setShowWelcome(false)} />;
  }

  return (
    <div className="app">
      <ScaleHeader scaleName={`${scale.rootName} ${scale.modeLabel}`} coins={coins} />

      <ScalePicker
        scale={scale}
        onSetRootPc={setRootPc}
        onSetModeIndex={setModeIndex}
        onRandomize={randomize}
        onPlayRoot={playRoot}
      />

      <nav className="tab-bar">
        {['exercise', 'arpeggio', 'practice'].map(t => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => handleTabChange(t)}
          >
            {t === 'practice' ? 'Free Practice' : t === 'exercise' ? 'Scale Exercise' : 'Arpeggio'}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {tab === 'practice' && (
          <>
            <ScaleDegrees notes={scale.notes} activeDegree={activeDegree} />
            <PitchDisplay isListening={isListening} detectedNote={detectedNote}
              detectedFreq={detectedFreq} cents={cents} activeDegree={activeDegree} />
          </>
        )}

        {tab === 'exercise' && (
          <>
            <Exercise sequence={sequence} currentIndex={exIndex} phase={exPhase}
              activeDegree={activeDegree} scaleNotes={scale.notes} failedIndices={failedIndices}
              onNew={newExercise} onStop={stopExercise} />
            <PitchDisplay isListening={isListening} detectedNote={detectedNote}
              detectedFreq={detectedFreq} cents={cents} activeDegree={activeDegree} />
          </>
        )}

        {tab === 'arpeggio' && (
          <>
            <ArpeggioExercise chord={chord} currentIndex={arpIndex} phase={arpPhase}
              activeTone={activeTone} failedTones={failedTones} onNew={newArpeggio} onStop={stopArpeggio} />
            {arpPhase !== 'singing' && <ChordSelector scaleChords={scaleChords} enabledDegrees={enabledDegrees} onToggle={toggleDegree} />}
            <PitchDisplay isListening={isListening} detectedNote={detectedNote}
              detectedFreq={detectedFreq} cents={cents} activeDegree={null} />
          </>
        )}
      </main>
    </div>
  );
}
