import { midiToNoteName } from '../utils/musicTheory';

export function Exercise({ sequence, currentIndex, phase, activeDegree, scaleNotes, failedIndices = new Set(), onNew, onStop }) {
  return (
    <div className="exercise">
      <div className="exercise-header">
        {phase === 'idle'    && <button className="btn-action" onClick={onNew}>Start Exercise</button>}
        {phase === 'singing' && <button className="btn-action btn-stop" onClick={onStop}>Stop</button>}
        {phase === 'singing' && sequence && (
          <span className="exercise-progress">
            {Math.min(currentIndex, sequence.length)} / {sequence.length}
          </span>
        )}
      </div>

      {phase === 'idle' && (
        <p className="exercise-prompt">
          Press <strong>Start Exercise</strong> to get a sequence of 6 scale degrees. Sing each one and hold to advance.
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
            const isFailed = isPast && failedIndices.has(i);
            const isSinging = isCurrent && activeDegree === degree;
            const isWrong = isCurrent && activeDegree !== null && activeDegree !== degree;

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
        <div className="time-bar-track">
          <div key={currentIndex} className="time-bar" />
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
