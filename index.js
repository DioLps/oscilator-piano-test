const freqTable = [
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
const minOctave = Math.min(...freqTable.map(item => parseInt(item.note.match(/\d+/)[0])));
const maxOctave = Math.max(...freqTable.map(item => parseInt(item.note.match(/\d+/)[0])));

let currentOctave = 4;  // Starting octave

// Piano UI and interaction logic
let audioContext;
let gainNode;
let activeOscillators = new Map(); // Track multiple playing notes
let pressedKeys = new Set(); // Track currently pressed keys
let pressedMouseKeys = new Set(); // Track mouse-pressed keys
// Reverb control
let reverbEnabled = false;
let reverbNode;
let reverbGain;

// Generate a basic impulse response for reverb
function createReverbBuffer() {
  const duration = 2; // seconds
  const rate = audioContext.sampleRate;
  const length = rate * duration;
  const impulse = audioContext.createBuffer(2, length, rate);
  for (let chan = 0; chan < 2; chan++) {
    const data = impulse.getChannelData(chan);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
  }
  return impulse;
}

// Vibrato control state
let vibratoEnabled = false;
const baseVibratoRate = 5.5;   // Base LFO rate in Hz
const baseVibratoDepth = 7;    // Base vibrato depth in Hz
const vibratoRampTime = 1.5;  // Ramp time in seconds for vibrato depth to reach full effect

// Add vibrato LFO to an existing oscillator entry
function addVibratoToOsc(noteKey) {
  const entry = activeOscillators.get(noteKey);
  if (!entry || entry.vibratoOsc) return;
  const { oscillator } = entry;
  // randomize rate/depth slightly for natural feel
  const rate = baseVibratoRate + (Math.random() * 0.6 - 0.3);
  const depth = baseVibratoDepth + (Math.random() * 2 - 1);
  const vibratoOsc = audioContext.createOscillator();
  const vibratoGain = audioContext.createGain();
  vibratoOsc.type = 'triangle';
  vibratoOsc.frequency.value = rate;
  const now = audioContext.currentTime;
  vibratoGain.gain.setValueAtTime(0, now);
  vibratoGain.gain.linearRampToValueAtTime(depth, now + vibratoRampTime);
  vibratoOsc.connect(vibratoGain);
  vibratoGain.connect(oscillator.frequency);
  entry.vibratoOsc = vibratoOsc;
  entry.vibratoGain = vibratoGain;
  vibratoOsc.start(now);
}

// Remove vibrato LFO from an entry gracefully
function removeVibratoFromOsc(noteKey) {
  const entry = activeOscillators.get(noteKey);
  if (!entry || !entry.vibratoOsc) return;
  const { vibratoOsc, vibratoGain } = entry;
  const now = audioContext.currentTime;
  // ramp down
  vibratoGain.gain.cancelScheduledValues(now);
  vibratoGain.gain.setValueAtTime(vibratoGain.gain.value, now);
  vibratoGain.gain.linearRampToValueAtTime(0, now + vibratoRampTime);
  setTimeout(() => {
    try { vibratoOsc.stop(); } catch (e) { }
    vibratoGain.disconnect();
  }, (vibratoRampTime + 0.05) * 1000);
  delete entry.vibratoOsc;
  delete entry.vibratoGain;
}

// Toggle reverb effect on or off and update UI
function toggleReverb() {
  reverbEnabled = !reverbEnabled;
  if (!audioContext) initAudio();
  reverbGain.gain.setValueAtTime(reverbEnabled ? 1 : 0, audioContext.currentTime);
  // Reflect state in checkbox
  const revToggle = document.getElementById('reverb-toggle');
  if (revToggle) revToggle.checked = reverbEnabled;
}

// Toggle vibrato effect on/off via checkbox
function toggleVibrato() {
  vibratoEnabled = !vibratoEnabled;
  if (!audioContext) initAudio();
  activeOscillators.forEach((_, noteKey) => {
    if (vibratoEnabled) addVibratoToOsc(noteKey);
    else removeVibratoFromOsc(noteKey);
  });
  const vibToggle = document.getElementById('vibrato-toggle');
  if (vibToggle) vibToggle.checked = vibratoEnabled;
}

// Note layout for piano keys (white in flex, black absolutely positioned)
// Get dynamic sizing based on CSS variables or viewport width
function getKeyWidths() {
  // Get a computed white key width (use actual DOM or fallback to responsive values)
  const computedWhiteWidth = Math.min(50, Math.max(30, window.innerWidth / 16));
  const computedBlackWidth = computedWhiteWidth * 0.6; // Black keys are 60% of white key width
  return {
    whiteWidth: computedWhiteWidth,
    blackWidth: computedBlackWidth
  };
}

// Get initial widths
const { whiteWidth, blackWidth } = getKeyWidths();
const borderWidth = 30; // match CSS border
const offset = whiteWidth - blackWidth / 2; // center black over white boundary

const noteLayout = [
  { note: 'C', type: 'white' },
  { note: 'C#', type: 'black', position: offset },
  { note: 'D', type: 'white' },
  { note: 'D#', type: 'black', position: whiteWidth + offset },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' },
  { note: 'F#', type: 'black', position: 3 * whiteWidth + offset + 8 },
  { note: 'G', type: 'white' },
  { note: 'G#', type: 'black', position: 4 * whiteWidth + offset + 10 },
  { note: 'A', type: 'white' },
  { note: 'A#', type: 'black', position: 5 * whiteWidth + offset + 14 },
  { note: 'B', type: 'white' },
  { note: 'C', type: 'white', isNextOctave: true }
];

// Piano key generation and layout logic here
// Generate piano keys
function generatePiano() {
  const piano = document.getElementById('piano');
  piano.innerHTML = '';

  // Recalculate widths for responsive layout
  const { whiteWidth, blackWidth } = getKeyWidths();

  noteLayout.forEach((noteInfo, idx) => {
    const key = document.createElement('div');
    key.className = `key ${noteInfo.type}-key`;
    key.dataset.note = noteInfo.note;
    const octave = noteInfo.isNextOctave ? currentOctave + 1 : currentOctave;
    key.dataset.octave = octave;
    key.textContent = noteInfo.note;

    // Set calculated widths directly on elements for responsiveness
    if (noteInfo.type === 'white') {
      key.style.width = `${whiteWidth}px`;
    } else {
      key.style.width = `${blackWidth}px`;
      key.style.left = `${noteInfo.position * (whiteWidth / 50)}px`; // Scale position based on actual white key width
    }

    key.addEventListener('mousedown', (e) => handleKeyPress(e, noteInfo.note));
    key.addEventListener('mouseup', (e) => handleKeyRelease(e, noteInfo.note));
    key.addEventListener('mouseleave', (e) => handleKeyRelease(e, noteInfo.note));
    // Touch events for mobile support
    key.addEventListener('touchstart', (e) => handleKeyPress(e, noteInfo.note), { passive: false });
    key.addEventListener('touchend', (e) => handleKeyRelease(e, noteInfo.note), { passive: false });
    key.addEventListener('touchcancel', (e) => handleKeyRelease(e, noteInfo.note), { passive: false });

    piano.appendChild(key);
  });

  // Set piano container width based on key count for proper scrolling
  const totalWhiteKeys = noteLayout.filter(n => n.type === 'white').length;
  piano.style.width = `${totalWhiteKeys * whiteWidth + 20}px`; // Add padding
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
  generatePiano();
  setupOctaveControls();
  setupVolumeControl();
  setupKeyboardSupport();

  // Handle window resize for responsive layout
  let resizeTimer;
  window.addEventListener('resize', () => {
    // Debounce the resize event
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      generatePiano(); // Rebuild piano with new dimensions
    }, 250);
  });

  // Effects toggles using checkboxes
  const vibToggle = document.getElementById('vibrato-toggle');
  if (vibToggle) vibToggle.addEventListener('change', toggleVibrato);
  const revToggle = document.getElementById('reverb-toggle');
  if (revToggle) revToggle.addEventListener('change', toggleReverb);

  initAudio();
  generatePiano();
});

// Initialize audio context
function initAudio() {
  if (audioContext) return; // Already initialized

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Resume context in user gesture to ensure audio plays on mobile
    audioContext.resume().then(() => console.log('AudioContext resumed on init'));
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.3; // Default volume
    // Set up reverb nodes (wet path)
    reverbNode = audioContext.createConvolver();
    reverbNode.buffer = createReverbBuffer();
    reverbGain = audioContext.createGain();
    // start with reverb off
    reverbGain.gain.value = 0;
    // Connect wet path: from main gain to convolver to reverb gain to destination
    gainNode.connect(reverbNode);
    reverbNode.connect(reverbGain);
    reverbGain.connect(audioContext.destination);

    console.log('AudioContext initialized successfully');

    // Update global variables for index.js compatibility
    window.audioContext = audioContext;
  } catch (e) {
    console.error('Web Audio API not supported:', e);
    alert('Sorry, your browser does not support Web Audio API. Please use a modern browser.');
  }
}

// Handle key press with simplified modifier detection
function handleKeyPress(event, note) {
  event.preventDefault();

  // Track that this key is being pressed via mouse
  pressedMouseKeys.add(note);

  // Use next octave if this is the last C key (with isNextOctave flag)
  const octave = (note === 'C' && event.target.dataset.octave && parseInt(event.target.dataset.octave) > currentOctave) ? 
                 currentOctave + 1 : currentOctave;
  
  // Play the note with the correct octave
  playNote(note, octave, event.target, event.shiftKey);
}

// Handle key release
function handleKeyRelease(event, note) {
  // Remove from pressed mouse keys
  pressedMouseKeys.delete(note);

  // Use next octave if this is the last C key (with isNextOctave flag)
  const octave = (note === 'C' && event.target.dataset.octave && parseInt(event.target.dataset.octave) > currentOctave) ? 
                 currentOctave + 1 : currentOctave;
  const noteKey = `${note}${octave}`;
  
  stopNote(noteKey, event.target);
}

// Play a note (supports multiple simultaneous notes)
function playNote(note, octave, keyElement, useVibrato = false) {
  // Initialize audio context on first interaction
  if (!audioContext) {
    initAudio();
  }

  // Resume audio context if suspended
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('AudioContext resumed');
    }).catch(e => {
      console.error('Failed to resume AudioContext:', e);
    });
  }

  const noteKey = `${note}${octave}`;

  // Don't play if already playing
  if (activeOscillators.has(noteKey)) {
    return;
  }

  // Find frequency from the frequency table
  const noteData = findNoteInTable(noteKey);

  if (noteData && audioContext) {
    try {
      // Create oscillator for this note
      const oscillator = audioContext.createOscillator();
      const noteGain = audioContext.createGain();

      oscillator.connect(noteGain);
      noteGain.connect(gainNode);

      // Set frequency and waveform
      oscillator.frequency.value = noteData.frequency;
      oscillator.type = 'sine';
      noteGain.gain.value = 0.3;

      // Add visual feedback
      keyElement.classList.add('playing');

      // Update display
      updateDisplay(noteKey, noteData.frequency);

      // Start playing
      oscillator.start();
      // Store the oscillator and gain nodes
      activeOscillators.set(noteKey, { oscillator, gainNode: noteGain, keyElement });
      // Start vibrato LFO if shift held
      if (vibratoEnabled || useVibrato) {
        addVibratoToOsc(noteKey);
      }

      // Auto-stop after 5 seconds (increased for polyphony)
      setTimeout(() => {
        if (activeOscillators.has(noteKey)) {
          stopNote(noteKey, keyElement);
        }
      }, 5000);
    } catch (e) {
      console.error('Error playing note:', e);
    }
  } else if (!noteData) {
    console.warn(`Note ${noteKey} not found in frequency table`);
  }
}

// Stop a specific note
function stopNote(noteKey, keyElement) {
  if (activeOscillators.has(noteKey)) {
    const noteData = activeOscillators.get(noteKey);
    try {
      noteData.oscillator.stop();
      // Stop vibrato LFO if it exists
      if (noteData.vibratoOsc) {
        removeVibratoFromOsc(noteKey);
      }
    } catch (e) {
      // Oscillator already stopped
    }

    // Remove visual feedback
    if (noteData.keyElement) {
      noteData.keyElement.classList.remove('playing');
    }

    activeOscillators.delete(noteKey);
  }
}

// Stop all notes
function stopAllNotes() {
  activeOscillators.forEach((noteData, noteKey) => {
    try {
      noteData.oscillator.stop();
    } catch (e) {
      // Oscillator already stopped
    }
    if (noteData.keyElement) {
      noteData.keyElement.classList.remove('playing');
    }
  });
  activeOscillators.clear();
}

// Find note in frequency table
function findNoteInTable(noteWithOctave) {
  return freqTable.find(item => item.note === noteWithOctave);
}

// Update octave display and button states
function updateOctaveDisplay() {
  document.getElementById('current-octave').textContent = currentOctave;

  // Update button states
  const downBtn = document.getElementById('octave-down');
  const upBtn = document.getElementById('octave-up');

  downBtn.disabled = currentOctave <= minOctave;
  upBtn.disabled = currentOctave >= maxOctave;
}

// Change octave function with note continuity
function changeOctave(direction) {
  const newOctave = currentOctave + direction;
  if (newOctave >= minOctave && newOctave <= maxOctave) {
    // Get currently playing notes before changing octave
    const currentlyPlayingNotes = [];

    // Check keyboard pressed keys
    pressedKeys.forEach(key => {
      const keyMap = {
        'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
        't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B'
      };
      const note = keyMap[key.toLowerCase()];
      if (note) {
        currentlyPlayingNotes.push({
          note: note,
          source: 'keyboard',
          element: document.querySelector(`[data-note="${note}"]`)
        });
      }
    });

    // Check mouse pressed keys
    pressedMouseKeys.forEach(note => {
      currentlyPlayingNotes.push({
        note: note,
        source: 'mouse',
        element: document.querySelector(`[data-note="${note}"]`)
      });
    });

    // Stop all current notes
    stopAllNotes();

    // Change octave
    currentOctave = newOctave;
    updateOctaveDisplay();
    generatePiano();

    // Restart notes in new octave after a brief delay
    setTimeout(() => {
      currentlyPlayingNotes.forEach(noteInfo => {
        const newElement = document.querySelector(`[data-note="${noteInfo.note}"]`);
        if (newElement) {
          playNote(noteInfo.note, currentOctave, newElement);
        }
      });
    }, 50); // Small delay to ensure clean transition
  }
}

// Setup octave controls
function setupOctaveControls() {
  const downBtn = document.getElementById('octave-down');
  const upBtn = document.getElementById('octave-up');

  downBtn.addEventListener('click', () => changeOctave(-1));
  upBtn.addEventListener('click', () => changeOctave(1));

  // Update initial button states
  updateOctaveDisplay();
}

// Update note and frequency display
function updateDisplay(note, frequency) {
  document.getElementById('current-note').textContent = note;
  document.getElementById('current-frequency').textContent = `Frequency: ${frequency.toFixed(2)} Hz`;
}

// Volume control
function setupVolumeControl() {
  const volumeSlider = document.getElementById('volume');
  const volumeValue = document.getElementById('volume-value');

  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    if (gainNode) {
      gainNode.gain.value = volume;
    }
    volumeValue.textContent = `${e.target.value}%`;
  });
}

// Keyboard support with improved octave controls
function setupKeyboardSupport() {
  const keyMap = {
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
    'k': 'C'  // Play next octave C
  };

  document.addEventListener('keydown', (e) => {
    if (pressedKeys.has(e.key)) return; // Prevent repeat
    pressedKeys.add(e.key);

    const note = keyMap[e.key.toLowerCase()];
    if (note) {
      let octave = currentOctave;
      let keySelector = `[data-note=\"${note}\"]`;
      if (e.key.toLowerCase() === 'k') {
        octave = currentOctave + 1;
        keySelector += `[data-octave=\"${octave}\"]`;
      }
      const keyElement = document.querySelector(keySelector);
      if (keyElement) {
        playNote(note, octave, keyElement, e.shiftKey);
      }
    }

    // Improved octave controls - work even while playing
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      changeOctave(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      changeOctave(-1);
    }

    // Space bar to stop all notes
    if (e.key === ' ') {
      e.preventDefault();
      stopAllNotes();
    }

    // Additional octave shortcuts
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      changeOctave(1);
    } else if (e.key === '-') {
      e.preventDefault();
      changeOctave(-1);
    }
  });

  document.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key);
    const note = keyMap[e.key.toLowerCase()];
    if (note) {
      let octave = currentOctave;
      if (e.key.toLowerCase() === 'k') {
        octave = currentOctave + 1;
      }
      const noteKey = `${note}${octave}`;
      const keyElement = document.querySelector(`[data-note="${note}"][data-octave="${octave}"]`);
      stopNote(noteKey, keyElement);
    }
  });
}

