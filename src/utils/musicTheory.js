export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const MODES = [
  { name: 'Ionian',     label: 'Major',      intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Dorian',     label: 'Dorian',     intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Phrygian',   label: 'Phrygian',   intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Lydian',     label: 'Lydian',     intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Mixolydian', label: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Aeolian',    label: 'Minor',      intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Locrian',    label: 'Locrian',    intervals: [0, 1, 3, 5, 6, 8, 10] },
];

const INTERVAL_LABELS = {
  0: 'Root', 1: '♭2', 2: '2nd', 3: '♭3', 4: '3rd',
  5: '4th',  6: '♭5', 7: '5th', 8: '♭6', 9: '6th', 10: '♭7', 11: '7th',
};

const DEGREE_BASES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export function intervalLabel(semitones) {
  return INTERVAL_LABELS[semitones] ?? '';
}

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

export function midiToNoteName(midi) {
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

export function buildScale(rootPc, modeIndex) {
  const mode = MODES[modeIndex];
  const rootMidi = 60 + rootPc;
  const notes = mode.intervals.map(i => rootMidi + i);
  return { rootPc, rootMidi, rootName: NOTE_NAMES[rootPc], modeIndex, modeName: mode.name, modeLabel: mode.label, intervals: mode.intervals, notes };
}

function scaleChordQuality(thirdInt, fifthInt) {
  if (thirdInt === 4 && fifthInt === 7) return { name: 'Major',      symbol: '',  upper: true };
  if (thirdInt === 3 && fifthInt === 7) return { name: 'Minor',      symbol: '',  upper: false };
  if (thirdInt === 3 && fifthInt === 6) return { name: 'Diminished', symbol: '°', upper: false };
  if (thirdInt === 4 && fifthInt === 8) return { name: 'Augmented',  symbol: '+', upper: true };
  return                                       { name: 'Mixed',       symbol: '?', upper: true };
}

export function buildScaleChord(scale, degreeIndex) {
  const { notes: scaleNotes, rootName: scaleRootName, modeLabel: modeName } = scale;

  const rootMidi  = scaleNotes[degreeIndex];
  const thirdMidi = scaleNotes[(degreeIndex + 2) % 7];
  const fifthMidi = scaleNotes[(degreeIndex + 4) % 7];

  const thirdInt = ((thirdMidi - rootMidi) + 12) % 12;
  const fifthInt  = ((fifthMidi - rootMidi)  + 12) % 12;

  const q = scaleChordQuality(thirdInt, fifthInt);
  const base = DEGREE_BASES[degreeIndex];
  const numeral = (q.upper ? base : base.toLowerCase()) + q.symbol;

  const rootPc = ((rootMidi % 12) + 12) % 12;
  const chordRootName = NOTE_NAMES[rootPc];

  return {
    rootMidi, rootPc,
    rootName: chordRootName,
    degreeIndex,
    numeral,
    quality: q.name,
    displayName: `${chordRootName} ${q.name}`,
    scaleContext: `${numeral} of ${scaleRootName} ${modeName}`,
    intervals: [0, thirdInt, fifthInt],
    notes: [rootMidi, rootMidi + thirdInt, rootMidi + fifthInt],
  };
}

export function getScaleChords(scale) {
  return Array.from({ length: 7 }, (_, i) => buildScaleChord(scale, i));
}

export function findNearestDegree(detectedMidi, scaleNotes, toleranceCents = 50) {
  let bestDegree = null;
  let bestCents = Infinity;
  for (let i = 0; i < scaleNotes.length; i++) {
    for (let o = -2; o <= 2; o++) {
      const diff = (detectedMidi - (scaleNotes[i] + o * 12)) * 100;
      if (Math.abs(diff) < Math.abs(bestCents)) { bestCents = diff; bestDegree = i + 1; }
    }
  }
  return Math.abs(bestCents) > toleranceCents ? { degree: null, cents: bestCents } : { degree: bestDegree, cents: bestCents };
}

export function generateExercise() {
  const length = Math.floor(Math.random() * 6) + 5;
  return Array.from({ length }, () => Math.floor(Math.random() * 7) + 1);
}
