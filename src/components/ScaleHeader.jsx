export function ScaleHeader({ scaleName, isListening, onStartMic, onStopMic }) {
  return (
    <header className="app-bar">
      <div className="app-bar-left">
        <h1 className="app-title">Vocal Scale Trainer</h1>
        <span className="app-scale-name">{scaleName}</span>
      </div>
      <button
        className={`btn-mic ${isListening ? 'listening' : ''}`}
        onClick={isListening ? onStopMic : onStartMic}
      >
        {isListening ? 'Stop Mic' : 'Start Mic'}
      </button>
    </header>
  );
}
