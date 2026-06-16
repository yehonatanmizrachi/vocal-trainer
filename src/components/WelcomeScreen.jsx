const FLOATING_NOTES = [
  { char: '♪', style: { top: '12%',  left: '7%',   fontSize: '2rem',   animationDuration: '9s',  animationDelay: '0s',   opacity: 0.22 } },
  { char: '♫', style: { top: '18%',  left: '88%',  fontSize: '1.6rem',  animationDuration: '13s', animationDelay: '2.1s', opacity: 0.18 } },
  { char: '♩', style: { top: '62%',  left: '4%',   fontSize: '1.9rem',  animationDuration: '11s', animationDelay: '4.3s', opacity: 0.2  } },
  { char: '♬', style: { top: '72%',  left: '91%',  fontSize: '2.4rem',  animationDuration: '10s', animationDelay: '1.2s', opacity: 0.25 } },
  { char: '♪', style: { top: '38%',  left: '94%',  fontSize: '1.3rem',  animationDuration: '15s', animationDelay: '3.5s', opacity: 0.14 } },
  { char: '♫', style: { top: '82%',  left: '14%',  fontSize: '2.1rem',  animationDuration: '12s', animationDelay: '5.8s', opacity: 0.19 } },
  { char: '♩', style: { top: '28%',  left: '2%',   fontSize: '1.7rem',  animationDuration: '8s',  animationDelay: '6.4s', opacity: 0.24 } },
  { char: '♬', style: { top: '52%',  left: '86%',  fontSize: '1.4rem',  animationDuration: '14s', animationDelay: '0.7s', opacity: 0.15 } },
  { char: '♪', style: { top: '88%',  left: '55%',  fontSize: '1.8rem',  animationDuration: '10s', animationDelay: '3s',   opacity: 0.16 } },
  { char: '♫', style: { top: '5%',   left: '46%',  fontSize: '1.5rem',  animationDuration: '16s', animationDelay: '7s',   opacity: 0.13 } },
];

export function WelcomeScreen({ onBegin }) {
  return (
    <div className="welcome-screen">
      {FLOATING_NOTES.map((n, i) => (
        <span key={i} className="floating-note" style={n.style} aria-hidden="true">
          {n.char}
        </span>
      ))}

      <div className="welcome-content">
        <div className="welcome-icon" aria-hidden="true">♬</div>

        <h1 className="welcome-title">Vocal Scale Trainer</h1>

        <p className="welcome-tagline">Train your ear. Find your voice.</p>

        <p className="welcome-desc">
          Sing scales, arpeggios, and intervals with live pitch detection.
          <br />
          No experience needed — just your voice and curiosity.
        </p>

        <button className="btn-begin" onClick={onBegin}>
          Start Practicing
        </button>

        <p className="welcome-footnote">
          Your microphone never leaves your device — all processing happens locally in your browser.
        </p>
      </div>
    </div>
  );
}
