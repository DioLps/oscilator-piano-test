/**
 * UI manipulation and display functions
 */

import { minOctave, maxOctave } from './constants.js';

// State variables
let currentOctave = 4;  // Starting octave

/**
 * Get current octave
 */
export function getCurrentOctave() {
  return currentOctave;
}

/**
 * Set current octave
 */
export function setCurrentOctave(octave) {
  if (octave >= minOctave && octave <= maxOctave) {
    currentOctave = octave;
    updateOctaveDisplay();
    return true;
  }
  return false;
}

/**
 * Update octave display and button states
 */
export function updateOctaveDisplay() {
  document.getElementById('current-octave').textContent = currentOctave;

  // Update button states
  const downBtn = document.getElementById('octave-down');
  const upBtn = document.getElementById('octave-up');

  downBtn.disabled = currentOctave <= minOctave;
  upBtn.disabled = currentOctave >= maxOctave;
}

/**
 * Setup volume control slider
 */
export function setupVolumeControl() {
  const volumeSlider = document.getElementById('volume');
  const volumeValue = document.getElementById('volume-value');
  
  if (!volumeSlider || !volumeValue) return;
  
  // Import audio module when needed to avoid circular dependencies
  import('./audio.js').then(audio => {
    const gainNode = audio.getGainNode();
    if (gainNode) {
      // Set slider to match current gain node value (0-1 to 0-100)
      const initialVolume = Math.round(gainNode.gain.value * 100);
      volumeSlider.value = initialVolume;
      volumeValue.textContent = `${initialVolume}%`;
    }
  });
  
  volumeSlider.addEventListener('input', (e) => {
    updateVolume(e.target.value);
  });
  
  // On change event (when user stops dragging) to ensure value is set
  volumeSlider.addEventListener('change', (e) => {
    updateVolume(e.target.value);
  });
  
  function updateVolume(value) {
    const volume = value / 100;
    
    import('./audio.js').then(audio => {
      const gainNode = audio.getGainNode();
      if (gainNode) {
        // Use the AudioParam API for smooth transitions
        const audioContext = audio.getAudioContext();
        if (audioContext) {
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        } else {
          gainNode.gain.value = volume;
        }
      }
    });
    
    volumeValue.textContent = `${value}%`;
  }
}
