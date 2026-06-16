function getTuningStatus(cents) {
  if (cents === null) return null;
  const abs = Math.abs(cents);
  const dir = cents < 0 ? 'flat' : 'sharp';
  if (abs < 20) return { label: 'In tune', cls: 'in-tune' };
  if (abs < 40) return { label: `Slightly ${dir}`, cls: 'slightly-off' };
  return { label: dir.charAt(0).toUpperCase() + dir.slice(1), cls: 'off' };
}

export function PitchDisplay({ isListening, detectedNote, detectedFreq, cents, activeDegree }) {
  if (!isListening) {
    return (
      <div className="pitch-display idle">
        <p>Press <strong>Start Mic</strong> and begin singing</p>
      </div>
    );
  }

  if (!detectedNote) {
    return (
      <div className="pitch-display listening">
        <p className="listening-indicator">Listening...</p>
      </div>
    );
  }

  const status = getTuningStatus(cents);

  return (
    <div className="pitch-display active">
      <div className="detected-note">{detectedNote}</div>
      <div className="detected-freq">{detectedFreq} Hz</div>
      {status && (
        <div className={`tuning-status ${status.cls}`}>
          {status.label}
          {Math.abs(cents) >= 5 && <span className="cents"> ({cents > 0 ? '+' : ''}{cents}¢)</span>}
        </div>
      )}
      {activeDegree && (
        <div className="active-degree-label">Degree {activeDegree}</div>
      )}
    </div>
  );
}
