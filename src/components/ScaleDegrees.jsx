import { midiToNoteName } from '../utils/musicTheory';

const DEGREE_LABELS = ['1', '2', '3', '4', '5', '6', '7'];
const DEGREE_NAMES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export function ScaleDegrees({ notes, activeDegree }) {
  return (
    <div className="scale-degrees">
      {notes.map((midi, i) => {
        const degree = i + 1;
        const isActive = activeDegree === degree;
        const isRoot = degree === 1;
        return (
          <div
            key={degree}
            className={`degree-card${isActive ? ' active' : ''}${isRoot ? ' root' : ''}`}
          >
            <span className="degree-number">{DEGREE_LABELS[i]}</span>
            <span className="degree-roman">{DEGREE_NAMES[i]}</span>
            <span className="degree-note">{midiToNoteName(midi)}</span>
          </div>
        );
      })}
    </div>
  );
}
