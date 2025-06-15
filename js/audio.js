/**
 * Audio context and sound generation
 */

import { freqTable } from './constants.js';

// Audio context variables
let audioContext;
let gainNode;
export let activeOscillators = new Map(); // Track multiple playing notes

/**
 * Initialize audio context and setup audio nodes
 */
export function initAudio() {
  if (audioContext) return audioContext; // Already initialized

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Resume context in user gesture to ensure audio plays on mobile
    audioContext.resume().then(() => console.log('AudioContext resumed on init'));
    
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.3; // Default volume
    
    console.log('AudioContext initialized successfully');
    
    // Make accessible for other modules
    window.audioContext = audioContext;
    return audioContext;
  } catch (e) {
    console.error('Web Audio API not supported:', e);
    alert('Sorry, your browser does not support Web Audio API. Please use a modern browser.');
    return null;
  }
}

/**
 * Get the audio context instance
 */
export function getAudioContext() {
  return audioContext;
}

/**
 * Get the main gain node
 */
export function getGainNode() {
  return gainNode;
}

/**
 * Connect an audio node to the main gain node
 */
export function connectToMainOutput(audioNode) {
  if (!gainNode || !audioNode) return false;
  audioNode.connect(gainNode);
  return true;
}

/**
 * Find note in frequency table
 */
export function findNoteInTable(noteWithOctave) {
  return freqTable.find(item => item.note === noteWithOctave);
}

/**
 * Play a musical note
 */
export function playNote(note, octave, keyElement, useVibrato = false) {
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
      
      // Import effects module to check if vibrato is enabled
      import('./effects.js').then(effects => {
        // Apply vibrato if manually specified OR if the global vibrato is enabled
        const shouldApplyVibrato = useVibrato || effects.isVibratoEnabled();
        if (shouldApplyVibrato) {
          effects.addVibratoToOsc(noteKey);
        }
      });
      
      // Notes will continue playing until explicitly stopped
      // No auto-stop timeout anymore
    } catch (e) {
      console.error('Error playing note:', e);
    }
  } else if (!noteData) {
    console.warn(`Note ${noteKey} not found in frequency table`);
  }
}

/**
 * Stop a specific note
 */
export function stopNote(noteKey, keyElement) {
  if (activeOscillators.has(noteKey)) {
    const noteData = activeOscillators.get(noteKey);
    try {
      noteData.oscillator.stop();
      // Stop vibrato LFO if it exists
      if (noteData.vibratoOsc) {
        // Import just when needed to avoid circular dependencies
        import('./effects.js').then(effects => {
          effects.removeVibratoFromOsc(noteKey);
        });
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

/**
 * Stop all playing notes
 */
export function stopAllNotes() {
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

/**
 * Update note and frequency display
 */
function updateDisplay(note, frequency) {
  document.getElementById('current-note').textContent = note;
  document.getElementById('current-frequency').textContent = `Frequency: ${frequency.toFixed(2)} Hz`;
}
