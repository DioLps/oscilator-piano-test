/**
 * Main initialization and event setup
 */

import { initAudio } from './audio.js';
import { setupReverb, toggleReverb, toggleVibrato } from './effects.js';
import { setupVolumeControl } from './ui.js';
import { setupKeyboardSupport } from './keyboard.js';
import { generatePiano, setupOctaveControls } from './piano.js';

/**
 * Initialize everything when the page loads
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
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

  // Initialize audio context and effects
  initAudio();
  setupReverb();
    // Setup effects toggles using checkboxes
  const vibToggle = document.getElementById('vibrato-toggle');
  if (vibToggle) {
    vibToggle.checked = false; // Start unchecked
    vibToggle.addEventListener('change', toggleVibrato);
  }
  
  const revToggle = document.getElementById('reverb-toggle');
  if (revToggle) {
    revToggle.checked = false; // Start unchecked
    revToggle.addEventListener('change', toggleReverb);
  }

  // Add click handler to initialize audio context on first interaction
  document.addEventListener('click', () => {
    initAudio();
  }, { once: true });

  // Also try to initialize on any user interaction
  ['mousedown', 'keydown', 'touchstart'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      initAudio();
    }, { once: true });
  });
});
