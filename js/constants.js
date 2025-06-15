/**
 * Frequency table and constants
 */

// Frequency data for piano notes
export const freqTable = [
  { note: "A0", frequency: 27.50 },
  { note: "A#0", frequency: 29.14 },
  { note: "B0", frequency: 30.87 },
  { note: "C1", frequency: 32.70 },
  { note: "C#1", frequency: 34.65 },
  { note: "D1", frequency: 36.71 },
  { note: "D#1", frequency: 38.89 },
  { note: "E1", frequency: 41.20 },
  { note: "F1", frequency: 43.65 },
  { note: "F#1", frequency: 46.25 },
  { note: "G1", frequency: 49.00 },
  { note: "G#1", frequency: 51.91 },
  { note: "A1", frequency: 55.00 },
  { note: "A#1", frequency: 58.27 },
  { note: "B1", frequency: 61.74 },
  { note: "C2", frequency: 65.41 },
  { note: "C#2", frequency: 69.30 },
  { note: "D2", frequency: 73.42 },
  { note: "D#2", frequency: 77.78 },
  { note: "E2", frequency: 82.41 },
  { note: "F2", frequency: 87.31 },
  { note: "F#2", frequency: 92.50 },
  { note: "G2", frequency: 98.00 },
  { note: "G#2", frequency: 103.83 },
  { note: "A2", frequency: 110.00 },
  { note: "A#2", frequency: 116.54 },
  { note: "B2", frequency: 123.47 },
  { note: "C3", frequency: 130.81 },
  { note: "C#3", frequency: 138.59 },
  { note: "D3", frequency: 146.83 },
  { note: "D#3", frequency: 155.56 },
  { note: "E3", frequency: 164.81 },
  { note: "F3", frequency: 174.61 },
  { note: "F#3", frequency: 185.00 },
  { note: "G3", frequency: 196.00 },
  { note: "G#3", frequency: 207.65 },
  { note: "A3", frequency: 220.00 },
  { note: "A#3", frequency: 233.08 },
  { note: "B3", frequency: 246.94 },
  { note: "C4", frequency: 261.63 },
  { note: "C#4", frequency: 277.18 },
  { note: "D4", frequency: 293.66 },
  { note: "D#4", frequency: 311.13 },
  { note: "E4", frequency: 329.63 },
  { note: "F4", frequency: 349.23 },
  { note: "F#4", frequency: 369.99 },
  { note: "G4", frequency: 392.00 },
  { note: "G#4", frequency: 415.30 },
  { note: "A4", frequency: 440.00 },
  { note: "A#4", frequency: 466.16 },
  { note: "B4", frequency: 493.88 },
  { note: "C5", frequency: 523.25 },
  { note: "C#5", frequency: 554.37 },
  { note: "D5", frequency: 587.33 },
  { note: "D#5", frequency: 622.25 },
  { note: "E5", frequency: 659.25 },
  { note: "F5", frequency: 698.46 },
  { note: "F#5", frequency: 739.99 },
  { note: "G5", frequency: 783.99 },
  { note: "G#5", frequency: 830.61 },
  { note: "A5", frequency: 880.00 },
  { note: "A#5", frequency: 932.33 },
  { note: "B5", frequency: 987.77 },
  { note: "C6", frequency: 1046.50 },
  { note: "C#6", frequency: 1108.73 },
  { note: "D6", frequency: 1174.66 },
  { note: "D#6", frequency: 1244.51 },
  { note: "E6", frequency: 1318.51 },
  { note: "F6", frequency: 1396.91 },
  { note: "F#6", frequency: 1479.98 },
  { note: "G6", frequency: 1567.98 },
  { note: "G#6", frequency: 1661.22 },
  { note: "A6", frequency: 1760.00 },
  { note: "A#6", frequency: 1864.66 },
  { note: "B6", frequency: 1975.53 },
  { note: "C7", frequency: 2093.00 },
  { note: "C#7", frequency: 2217.46 },
  { note: "D7", frequency: 2349.32 },
  { note: "D#7", frequency: 2489.02 },
  { note: "E7", frequency: 2637.02 },
  { note: "F7", frequency: 2793.83 },
  { note: "F#7", frequency: 2959.96 },
  { note: "G7", frequency: 3135.96 },
  { note: "G#7", frequency: 3322.44 },
  { note: "A7", frequency: 3520.00 },
  { note: "A#7", frequency: 3729.31 },
  { note: "B7", frequency: 3951.07 },
  { note: "C8", frequency: 4186.01 }
];

// Determine octave limits based on available frequencies
export const minOctave = Math.min(...freqTable.map(item => parseInt(item.note.match(/\d+/)[0])));
export const maxOctave = Math.max(...freqTable.map(item => parseInt(item.note.match(/\d+/)[0])));

// Vibrato constants
export const baseVibratoRate = 5.5;   // Base LFO rate in Hz
export const baseVibratoDepth = 7;    // Base vibrato depth in Hz
export const vibratoRampTime = 1.5;   // Ramp time in seconds for vibrato depth to reach full effect

// Piano keyboard layout configuration
export const noteLayout = [
  { note: 'C', type: 'white' },
  { note: 'C#', type: 'black', position: 1 }, // positions will be calculated in piano.js
  { note: 'D', type: 'white' },
  { note: 'D#', type: 'black', position: 2 },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' },
  { note: 'F#', type: 'black', position: 3 },
  { note: 'G', type: 'white' },
  { note: 'G#', type: 'black', position: 4 },
  { note: 'A', type: 'white' },
  { note: 'A#', type: 'black', position: 5 },
  { note: 'B', type: 'white' },
  { note: 'C', type: 'white', isNextOctave: true }
];

// Keyboard mapping
export const keyboardMap = {
  'a': 'C',
  'w': 'C#',
  's': 'D',
  'e': 'D#',
  'd': 'E',
  'f': 'F',
  't': 'F#',
  'g': 'G',
  'y': 'G#',
  'h': 'A',
  'u': 'A#',
  'j': 'B',
  'k': 'C'  // Next octave C
};
