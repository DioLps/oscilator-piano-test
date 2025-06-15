/**
 * Piano generation and interaction
 */

import { noteLayout } from './constants.js';
import { playNote, stopNote, stopAllNotes } from './audio.js';
import { getCurrentOctave, setCurrentOctave, updateOctaveDisplay } from './ui.js';

// Track mouse-pressed keys
let pressedMouseKeys = new Set();

/**
 * Get dynamic sizing based on CSS variables or viewport width
 */
export function getKeyWidths() {
    const container = document.getElementById('container') || document.body;
    const containerWidth = container.clientWidth || window.innerWidth;

    // Calculate based on available container width with padding
    const availableWidth = containerWidth - 70; // Account for padding/margins

    // Count white keys in the current layout
    const whiteKeyCount = noteLayout ? noteLayout.filter(note => note.type === 'white').length : 7;

    // Calculate white key width, ensuring minimum size for usability
    const calculatedWhiteWidth = availableWidth / whiteKeyCount;
    const minWhiteKeyWidth = 35; // Minimum width for touch interaction
    const maxWhiteKeyWidth = 80; // Maximum width to prevent overly large keys

    const whiteWidth = Math.max(minWhiteKeyWidth, Math.min(maxWhiteKeyWidth, calculatedWhiteWidth));
    const blackWidth = whiteWidth * 0.6; // Black keys are 60% of white key width

    return {
        whiteWidth: whiteWidth,
        blackWidth: blackWidth
    };
}

/**
 * Generate piano keys
 */
export function generatePiano() {
    const piano = document.getElementById('piano');
    if (!piano) return;

    piano.innerHTML = '';
    const currentOctave = getCurrentOctave();

    // Recalculate widths for responsive layout
    const { whiteWidth, blackWidth } = getKeyWidths();

    // Keep track of white key positions for black key placement
    let whiteKeyPositions = [];

    // First pass: Create all white keys and track their positions
    const whiteKeys = noteLayout.filter(info => info.type === 'white');
    whiteKeys.forEach((noteInfo, idx) => {
        const key = document.createElement('div');
        key.className = `key ${noteInfo.type}-key`;
        key.dataset.note = noteInfo.note;
        const octave = noteInfo.isNextOctave ? currentOctave + 1 : currentOctave;
        key.dataset.octave = octave;
        key.textContent = noteInfo.note;

        // Set width and position for white keys
        key.style.width = `${whiteWidth}px`;
        const whiteKeyPosition = idx * whiteWidth;
        key.style.left = `${whiteKeyPosition}px`;

        // Store the position for placing black keys
        whiteKeyPositions.push(whiteKeyPosition);

        // Add event listeners
        key.addEventListener('mousedown', (e) => handleKeyPress(e, noteInfo.note));
        key.addEventListener('mouseup', (e) => handleKeyRelease(e, noteInfo.note));
        key.addEventListener('mouseleave', (e) => handleKeyRelease(e, noteInfo.note));

        // Touch events for mobile support
        key.addEventListener('touchstart', (e) => handleKeyPress(e, noteInfo.note), { passive: false });
        key.addEventListener('touchend', (e) => handleKeyRelease(e, noteInfo.note), { passive: false });
        key.addEventListener('touchcancel', (e) => handleKeyRelease(e, noteInfo.note), { passive: false });

        piano.appendChild(key);
    });

    // Second pass: Create all black keys with correct positions
    noteLayout
        .filter(info => info.type === 'black')
        .forEach((noteInfo, blackKeyIndex, self) => {

            const key = document.createElement('div');
            key.className = `key ${noteInfo.type}-key`;
            key.dataset.note = noteInfo.note;
            const octave = noteInfo.isNextOctave ? currentOctave + 1 : currentOctave;
            key.dataset.octave = octave;
            key.textContent = noteInfo.note;

            key.style.width = `${blackWidth}px`;

            // Calculate position based on note name
            let position;

            // Position black keys based on their position between white keys
            // White key sequence: C D E F G A B C
            // Black key sequence: C# D#   F# G# A#
            switch (noteInfo.note) {
                case 'C#':
                    position = whiteKeyPositions[0] + (whiteWidth * 0.7);
                    break;
                case 'D#':
                    position = whiteKeyPositions[1] + (whiteWidth * 0.7);
                    break;
                case 'F#':
                    position = whiteKeyPositions[3] + (whiteWidth * 0.7);
                    break;
                case 'G#':
                    position = whiteKeyPositions[4] + (whiteWidth * 0.7);
                    break;
                case 'A#':
                    position = whiteKeyPositions[5] + (whiteWidth * 0.7);
                    break;
                default:
                    // Fallback for any other black keys
                    // const noteIndex = noteLayout.findIndex(nl => nl.note === noteInfo.note);
                    const prevWhiteIndex = Math.floor(blackKeyIndex / 2);
                    position = whiteKeyPositions[prevWhiteIndex] + (whiteWidth * 0.7);
            }

            // Apply mobile offset for the last 3 black keys on mobile (768px)
            const isLastThreeBlackKeys = blackKeyIndex >= self.length - 3;

            if (window.innerWidth <= 768 && isLastThreeBlackKeys) {
                position += 10;
            }

            key.style.left = `${position}px`;

            // Add event listeners
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
    const totalWhiteKeys = whiteKeys.length;
    piano.style.width = `${totalWhiteKeys * whiteWidth + 20}px`; // Add padding
}

/**
 * Handle key press
 */
function handleKeyPress(event, note) {
    event.preventDefault();

    // Track that this key is being pressed via mouse
    pressedMouseKeys.add(note);

    // Use the octave from the dataset of the key element
    const octave = parseInt(event.target.dataset.octave);

    // Play the note with the correct octave
    // Let the audio.js module check if vibrato should be applied based on global toggle
    playNote(note, octave, event.target);
}

/**
 * Handle key release
 */
function handleKeyRelease(event, note) {
    // Remove from pressed mouse keys
    pressedMouseKeys.delete(note);

    // Use the octave from the dataset of the key element
    const octave = parseInt(event.target.dataset.octave);

    const noteKey = `${note}${octave}`;
    stopNote(noteKey, event.target);
}

/**
 * Setup octave controls
 */
export function setupOctaveControls() {
    const downBtn = document.getElementById('octave-down');
    const upBtn = document.getElementById('octave-up');

    if (downBtn) {
        downBtn.addEventListener('click', () => changeOctave(-1));
    }

    if (upBtn) {
        upBtn.addEventListener('click', () => changeOctave(1));
    }

    // Update initial button states
    updateOctaveDisplay();
}

/**
 * Change octave with note continuity
 */
export function changeOctave(direction) {
    const currentOctave = getCurrentOctave();
    const newOctave = currentOctave + direction;

    if (newOctave < 0 || newOctave > 8) return; // Stay within piano range

    // Get currently playing notes before changing octave
    const currentlyPlayingNotes = [];

    // Check keyboard pressed keys
    const keyboardMap = {
        'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
        't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B'
    };

    // Check if the keyboard module is available (to avoid circular dependencies)
    try {
        const keyboardModule = require('./keyboard.js');
        if (keyboardModule.pressedKeys) {
            keyboardModule.pressedKeys.forEach(key => {
                const note = keyboardMap[key.toLowerCase()];
                if (note) {
                    currentlyPlayingNotes.push({
                        note: note,
                        source: 'keyboard',
                        element: document.querySelector(`[data-note="${note}"]`)
                    });
                }
            });
        }
    } catch (e) {
        console.log('Keyboard module not available for pressed keys');
    }

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
    setCurrentOctave(newOctave);
    generatePiano();

    // Restart notes in new octave after a brief delay
    setTimeout(() => {
        currentlyPlayingNotes.forEach(noteInfo => {
            const newElement = document.querySelector(`[data-note="${noteInfo.note}"]`);
            if (newElement) {
                playNote(noteInfo.note, newOctave, newElement);
            }
        });
    }, 50); // Small delay to ensure clean transition
}
