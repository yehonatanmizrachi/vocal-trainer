import { midiToNoteName, intervalLabel } from '../utils/musicTheory';

export function ChordSelector({ scaleChords, enabledDegrees, onToggle }) {
  return (
    <div className="chord-selector">
      <p className="chord-selector-label">Practice these chords</p>
      <div className="chord-selector-grid">
        {scaleChords.map((chord, i) => (
          <button
            key={i}
            className={`chord-toggle${enabledDegrees.has(i) ? ' enabled' : ''}`}
            onClick={() => onToggle(i)}
            title={chord.displayName}
          >
            <span className="chord-numeral">{chord.numeral}</span>
            <span className="chord-toggle-name">{chord.rootName}</span>
            <span className="chord-toggle-quality">{chord.quality}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ArpeggioExercise({ chord, currentIndex, phase, activeTone, failedTones = new Set(), onNew }) {
  return (
    <div className="exercise">
      <div className="exercise-header">
        <button className="btn-action" onClick={onNew}>
          {phase === 'idle' ? 'Start Arpeggio' : 'New Arpeggio'}
        </button>
        {chord && phase === 'singing' && (
          <span className="exercise-progress">
            {currentIndex} / {chord.notes.length}
          </span>
        )}
      </div>

      {phase === 'idle' && (
        <p className="exercise-prompt">
          Toggle chord degrees below, then press <strong>Start Arpeggio</strong>.<br />
          Sing each note of the chord in order to advance.
        </p>
      )}

      {phase === 'done' && chord && (
        <div className="exercise-done">
          <div className="done-checkmark">✓</div>
          <p>{chord.scaleContext} — complete!</p>
          <button className="btn-action" onClick={onNew}>Next Arpeggio</button>
        </div>
      )}

      {chord && phase === 'singing' && (
        <>
          <div className="arpeggio-label-group">
            <span className="arpeggio-numeral">{chord.numeral}</span>
            <div>
              <div className="arpeggio-chord-name">{chord.displayName}</div>
              <div className="arpeggio-context">{chord.scaleContext}</div>
            </div>
          </div>

          <div className="exercise-sequence">
            {chord.notes.map((midi, i) => {
              const isPast    = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isFailed  = isPast && failedTones.has(i);
              const isSinging = isCurrent && activeTone === i + 1;
              const isWrong   = isCurrent && activeTone !== null && activeTone !== i + 1;

              return (
                <div
                  key={i}
                  className={`ex-card${isPast ? ' past' : ''}${isFailed ? ' failed' : ''}${isCurrent ? ' current' : ' future'}${isSinging ? ' singing' : ''}${isWrong ? ' wrong' : ''}`}
                >
                  {isPast ? (
                    isFailed
                      ? <span className="ex-fail">✗</span>
                      : <span className="ex-check">✓</span>
                  ) : (
                    <>
                      <span className="ex-degree">{midiToNoteName(midi)}</span>
                      <span className="ex-note">{intervalLabel(chord.intervals[i])}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="time-bar-track">
            <div key={currentIndex} className="time-bar" />
          </div>

          <div className="exercise-target">
            <span className="target-label">Sing</span>
            <span className="target-degree">{midiToNoteName(chord.notes[currentIndex])}</span>
            <span className="target-note">{intervalLabel(chord.intervals[currentIndex])}</span>
            <span className="target-hint">Hold the note to advance</span>
          </div>
        </>
      )}
    </div>
  );
}
