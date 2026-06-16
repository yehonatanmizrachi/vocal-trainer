import { NOTE_NAMES, MODES } from '../utils/musicTheory';

export function ScalePicker({ scale, onSetRootPc, onSetModeIndex, onRandomize, onPlayRoot }) {
  return (
    <div className="scale-picker">
      <div className="picker-row">
        <span className="picker-label">Root</span>
        <div className="picker-buttons">
          {NOTE_NAMES.map((name, pc) => (
            <button
              key={pc}
              className={`picker-btn${scale.rootPc === pc ? ' selected' : ''}`}
              onClick={() => onSetRootPc(pc)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="picker-row">
        <span className="picker-label">Mode</span>
        <div className="picker-buttons">
          {MODES.map((mode, i) => (
            <button
              key={mode.name}
              className={`picker-btn${scale.modeIndex === i ? ' selected' : ''}`}
              onClick={() => onSetModeIndex(i)}
              title={mode.name !== mode.label ? mode.name : undefined}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="picker-actions">
        <button className="btn-action" onClick={onRandomize}>Randomize</button>
        <button className="btn-action btn-play-root" onClick={onPlayRoot}>Play Root</button>
      </div>
    </div>
  );
}
