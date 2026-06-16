import { useState } from 'react';
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

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [tab, setTab] = useState('practice');

  const { scale, setRootPc, setModeIndex, randomize, playRoot } = useScale();

  const {
    isListening, detectedNote, detectedFreq, detectedMidi,
    cents, activeDegree, startListening,
  } = usePitchDetection(scale.notes);

  const { sequence, currentIndex: exIndex, phase: exPhase, newExercise } = useExercise(activeDegree);

  const scaleChords = getScaleChords(scale);

  const {
    chord, currentIndex: arpIndex, phase: arpPhase, activeTone,
    enabledDegrees, toggleDegree, newArpeggio,
  } = useArpeggio(detectedFreq, scale);

  const switchTab = (t) => {
    setTab(t);
    if (t === 'practice' && !isListening) startListening();
  };

  const handleNewExercise = () => {
    if (!isListening) startListening();
    newExercise();
  };

  const handleNewArpeggio = () => {
    if (!isListening) startListening();
    newArpeggio();
  };

  if (showWelcome) {
    return <WelcomeScreen onBegin={() => setShowWelcome(false)} />;
  }

  return (
    <div className="app">
      <ScaleHeader scaleName={`${scale.rootName} ${scale.modeLabel}`} />

      <ScalePicker
        scale={scale}
        onSetRootPc={setRootPc}
        onSetModeIndex={setModeIndex}
        onRandomize={randomize}
        onPlayRoot={playRoot}
      />

      <nav className="tab-bar">
        {['practice', 'exercise', 'arpeggio'].map(t => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => switchTab(t)}
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
              activeDegree={activeDegree} scaleNotes={scale.notes} onNew={handleNewExercise} />
            <PitchDisplay isListening={isListening} detectedNote={detectedNote}
              detectedFreq={detectedFreq} cents={cents} activeDegree={activeDegree} />
          </>
        )}

        {tab === 'arpeggio' && (
          <>
            <ArpeggioExercise chord={chord} currentIndex={arpIndex} phase={arpPhase}
              activeTone={activeTone} onNew={handleNewArpeggio} />
            <ChordSelector scaleChords={scaleChords} enabledDegrees={enabledDegrees} onToggle={toggleDegree} />
            <PitchDisplay isListening={isListening} detectedNote={detectedNote}
              detectedFreq={detectedFreq} cents={cents} activeDegree={null} />
          </>
        )}
      </main>
    </div>
  );
}
