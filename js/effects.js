/**
 * Audio effects (reverb, vibrato)
 */

import { baseVibratoRate, baseVibratoDepth, vibratoRampTime } from './constants.js';
import { getAudioContext, activeOscillators } from './audio.js';

// Effect state variables
let reverbEnabled = false;
let reverbNode;
let reverbGain;
let vibratoEnabled = false;

/**
 * Create reverb impulse response buffer
 */
function createReverbBuffer() {
  const audioContext = getAudioContext();
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

/**
 * Setup reverb effect chain
 */
export function setupReverb() {
  const audioContext = getAudioContext();
  if (!audioContext) return;
  
  // Create reverb node
  reverbNode = audioContext.createConvolver();
  reverbNode.buffer = createReverbBuffer();
  
  // Create reverb gain
  reverbGain = audioContext.createGain();
  reverbGain.gain.value = 0; // Start with reverb off
  
  // Get the main gain node from audio module
  import('./audio.js').then(audio => {
    const gainNode = audio.getGainNode();
    if (!gainNode) return;
    
    // Connect wet path: from main gain to convolver to reverb gain to destination
    gainNode.connect(reverbNode);
    reverbNode.connect(reverbGain);
    reverbGain.connect(audioContext.destination);
    
    console.log('Reverb effect chain connected successfully');
  });
  
  return { reverbNode, reverbGain };
}

/**
 * Toggle reverb effect on/off
 */
export function toggleReverb(event) {
  // If triggered by an event, use the checkbox's checked state
  if (event && event.target) {
    reverbEnabled = event.target.checked;
  } else {
    // Otherwise toggle the current state
    reverbEnabled = !reverbEnabled;
    
    // Update the UI to reflect the new state
    const revToggle = document.getElementById('reverb-toggle');
    if (revToggle) revToggle.checked = reverbEnabled;
  }
  
  const audioContext = getAudioContext();
  if (!audioContext) return;
  
  if (!reverbNode || !reverbGain) {
    setupReverb();
    // Give a moment for setup to complete
    setTimeout(() => {
      if (reverbGain) {
        reverbGain.gain.setValueAtTime(reverbEnabled ? 1 : 0, audioContext.currentTime);
      }
    }, 100);
  } else {
    reverbGain.gain.setValueAtTime(reverbEnabled ? 1 : 0, audioContext.currentTime);
  }
  
  console.log(`Reverb ${reverbEnabled ? 'enabled' : 'disabled'}`);
  return reverbEnabled;
}

/**
 * Toggle vibrato effect on/off
 */
export function toggleVibrato(event) {
  // If triggered by an event, use the checkbox's checked state
  if (event && event.target) {
    vibratoEnabled = event.target.checked;
  } else {
    // Otherwise toggle the current state
    vibratoEnabled = !vibratoEnabled;
    
    // Update the UI to reflect the new state
    const vibToggle = document.getElementById('vibrato-toggle');
    if (vibToggle) vibToggle.checked = vibratoEnabled;
  }
  
  const audioContext = getAudioContext();
  if (!audioContext) return;
  
  // Create a copy of the keys because we'll be modifying the map while iterating
  const noteKeys = Array.from(activeOscillators.keys());
  
  // Apply or remove vibrato for all currently playing notes
  for (const noteKey of noteKeys) {
    if (vibratoEnabled) {
      addVibratoToOsc(noteKey);
    } else {
      removeVibratoFromOsc(noteKey);
    }
  }
  
  console.log(`Vibrato ${vibratoEnabled ? 'enabled' : 'disabled'}`);
  return vibratoEnabled;
}

/**
 * Add vibrato LFO to an existing oscillator entry
 */
export function addVibratoToOsc(noteKey) {
  const audioContext = getAudioContext();
  if (!audioContext) return;
  
  const entry = activeOscillators.get(noteKey);
  if (!entry) return;
  
  // If vibrato is already applied, don't add it again
  if (entry.vibratoOsc) {
    console.log(`Vibrato already applied to ${noteKey}`);
    return;
  }
  
  const { oscillator } = entry;
  
  // Randomize rate/depth slightly for natural feel
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
  
  console.log(`Applied vibrato to ${noteKey}`);
}

/**
 * Remove vibrato LFO from an entry gracefully
 */
export function removeVibratoFromOsc(noteKey) {
  const audioContext = getAudioContext();
  if (!audioContext) return;
  
  const entry = activeOscillators.get(noteKey);
  if (!entry || !entry.vibratoOsc || !entry.vibratoGain) {
    // Nothing to remove
    return;
  }
  
  const { vibratoOsc, vibratoGain } = entry;
  const now = audioContext.currentTime;
  
  // Ramp down
  vibratoGain.gain.cancelScheduledValues(now);
  vibratoGain.gain.setValueAtTime(vibratoGain.gain.value, now);
  vibratoGain.gain.linearRampToValueAtTime(0, now + vibratoRampTime);
  
  // After ramp is complete, stop oscillator and disconnect
  setTimeout(() => {
    try {
      vibratoOsc.stop();
      vibratoOsc.disconnect();
      vibratoGain.disconnect();
      
      // If this note is still playing, update its entry
      const currentEntry = activeOscillators.get(noteKey);
      if (currentEntry) {
        delete currentEntry.vibratoOsc;
        delete currentEntry.vibratoGain;
      }
      
      console.log(`Removed vibrato from ${noteKey}`);
    } catch (e) {
      console.error(`Error cleaning up vibrato for ${noteKey}:`, e);
    }
  }, (vibratoRampTime + 0.05) * 1000);
}

/**
 * Get vibrato enabled status
 */
export function isVibratoEnabled() {
  return vibratoEnabled;
}
