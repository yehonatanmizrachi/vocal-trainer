export function ScaleHeader({ scaleName, coins }) {
  return (
    <header className="app-bar">
      <div className="app-bar-left">
        <h1 className="app-title">Vocal Scale Trainer</h1>
        <span className="app-scale-name">{scaleName}</span>
      </div>
      <span key={coins} className="coin-counter">
        🪙 {coins}
      </span>
    </header>
  );
}
