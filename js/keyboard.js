/**
 * Keyboard interaction handling
 */

import { keyboardMap } from './constants.js';
import { playNote, stopNote, stopAllNotes } from './audio.js';
import { getCurrentOctave } from './ui.js';
import { changeOctave } from './piano.js';

// Track key states
let pressedKeys = new Set(); // Track currently pressed keyboard keys

/**
 * Setup keyboard support with improved octave controls
 */
export function setupKeyboardSupport() {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
}

/**
 * Handle keydown events
 */
function handleKeyDown(e) {
  // Prevent repeating keys
  if (pressedKeys.has(e.key)) return;
  pressedKeys.add(e.key);

  const note = keyboardMap[e.key.toLowerCase()];
  const currentOctave = getCurrentOctave();
  
  if (note) {
    let octave = currentOctave;
    let keySelector = `[data-note="${note}"]`;
    
    if (e.key.toLowerCase() === 'k') {
      octave = currentOctave + 1;
      keySelector += `[data-octave="${octave}"]`;
    }
      const keyElement = document.querySelector(keySelector);
    if (keyElement) {
      // If shift key is held, force vibrato regardless of toggle state
      playNote(note, octave, keyElement, e.shiftKey);
    }
  }

  // Octave controls
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
}

/**
 * Handle keyup events
 */
function handleKeyUp(e) {
  pressedKeys.delete(e.key);
  const currentOctave = getCurrentOctave();
  const note = keyboardMap[e.key.toLowerCase()];
  
  if (note) {
    let octave = currentOctave;
    if (e.key.toLowerCase() === 'k') {
      octave = currentOctave + 1;
    }
    const noteKey = `${note}${octave}`;
    const keyElement = document.querySelector(`[data-note="${note}"][data-octave="${octave}"]`);
    stopNote(noteKey, keyElement);
  }
}
