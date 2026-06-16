import { midiToNoteName } from '../utils/musicTheory';

export function Exercise({ sequence, currentIndex, phase, activeDegree, scaleNotes, onNew }) {
  return (
    <div className="exercise">
      <div className="exercise-header">
        <button className="btn-action" onClick={onNew}>
          {phase === 'idle' ? 'Start Exercise' : 'New Exercise'}
        </button>
        {sequence && phase !== 'idle' && (
          <span className="exercise-progress">
            {Math.min(currentIndex, sequence.length)} / {sequence.length}
          </span>
        )}
      </div>

      {phase === 'idle' && (
        <p className="exercise-prompt">
          Press <strong>Start Exercise</strong> to get a random sequence of 5–10 scale degrees. Sing each one to advance.
        </p>
      )}

      {phase === 'done' && (
        <div className="exercise-done">
          <div className="done-checkmark">✓</div>
          <p>Exercise complete!</p>
          <button className="btn-action" onClick={onNew}>Next Exercise</button>
        </div>
      )}

      {sequence && phase === 'singing' && (
        <div className="exercise-sequence">
          {sequence.map((degree, i) => {
            const noteName = scaleNotes ? midiToNoteName(scaleNotes[degree - 1]) : '';
            const isPast = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isSinging = isCurrent && activeDegree === degree;

            return (
              <div
                key={i}
                className={`ex-card${isPast ? ' past' : ''}${isCurrent ? ' current' : ' future'}${isSinging ? ' singing' : ''}`}
              >
                {isPast ? (
                  <span className="ex-check">✓</span>
                ) : (
                  <>
                    <span className="ex-degree">{degree}</span>
                    <span className="ex-note">{noteName}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sequence && phase === 'singing' && (
        <div className="exercise-target">
          <span className="target-label">Sing degree</span>
          <span className="target-degree">{sequence[currentIndex]}</span>
          <span className="target-note">
            {scaleNotes ? midiToNoteName(scaleNotes[sequence[currentIndex] - 1]) : ''}
          </span>
          <span className="target-hint">Hold the note to advance</span>
        </div>
      )}
    </div>
  );
}
