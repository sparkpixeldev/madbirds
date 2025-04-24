/**
 * @fileoverview Manages UI elements, HUD updates, modals, and local storage.
 */

// --- DOM Element References ---
let scoreElement, birdsLeftElement, starsElement, restartButton, nextLevelButton, muteButton, levelDisplayElement;
let levelCompleteDialog, gameOverDialog, finalScoreElement, finalStarsElement;
let dialogNextLevelButton, dialogReplayButton, dialogGameOverRestartButton;

/** Stores callbacks for button actions */
const actions = {
    restartLevel: null,
    nextLevel: null,
    toggleMute: null,
};

const STORAGE_KEY = 'angryBirdsCloneProgress';

/**
 * Initializes the UI module, gets element references, and attaches listeners.
 * @param {object} callbacks - Object containing functions for button actions.
 *                             Expected keys: restartLevel, nextLevel, toggleMute.
 */
export function initUI(callbacks) {
    scoreElement = document.getElementById('score');
    birdsLeftElement = document.getElementById('birds-left');
    starsElement = document.getElementById('stars');
    restartButton = document.getElementById('restart-button');
    nextLevelButton = document.getElementById('next-level-button');
    muteButton = document.getElementById('mute-button');
    levelDisplayElement = document.getElementById('level-display');

    levelCompleteDialog = document.getElementById('level-complete-dialog');
    gameOverDialog = document.getElementById('game-over-dialog');
    finalScoreElement = document.getElementById('final-score');
    finalStarsElement = document.getElementById('final-stars');
    dialogNextLevelButton = document.getElementById('dialog-next-level');
    dialogReplayButton = document.getElementById('dialog-replay-level');
    dialogGameOverRestartButton = document.getElementById('dialog-restart-game-over');

    if (!scoreElement || !birdsLeftElement || !starsElement || !restartButton || !nextLevelButton || !muteButton || !levelDisplayElement || !levelCompleteDialog || !gameOverDialog || !finalScoreElement || !finalStarsElement || !dialogNextLevelButton || !dialogReplayButton || !dialogGameOverRestartButton) {
        console.error("UI Initialization Failed: One or more HUD/dialog elements not found!");
        return;
    }

    // Assign actions
    actions.restartLevel = callbacks.restartLevel;
    actions.nextLevel = callbacks.nextLevel;
    actions.toggleMute = callbacks.toggleMute;

    // Attach button listeners
    restartButton.addEventListener('click', () => actions.restartLevel());
    nextLevelButton.addEventListener('click', () => actions.nextLevel());
    muteButton.addEventListener('click', () => {
        const isMuted = actions.toggleMute();
        updateMuteButton(isMuted);
    });

    // Dialog button listeners
    dialogNextLevelButton.addEventListener('click', () => {
        levelCompleteDialog.close();
        actions.nextLevel();
    });
    dialogReplayButton.addEventListener('click', () => {
        levelCompleteDialog.close();
        actions.restartLevel();
    });
     dialogGameOverRestartButton.addEventListener('click', () => {
        gameOverDialog.close();
        actions.restartLevel(); // Restart current level on game over
    });

    // Close dialog on backdrop click (optional)
    levelCompleteDialog.addEventListener("click", (e) => {
        if (e.target === levelCompleteDialog) levelCompleteDialog.close();
    });
    gameOverDialog.addEventListener("click", (e) => {
        if (e.target === gameOverDialog) gameOverDialog.close();
    });

    console.log("UI Initialized");
}

// --- HUD Update Functions ---

/**
 * Updates the score display in the HUD.
 * @param {number} score - The current score.
 */
export function updateScore(score) {
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }
}

/**
 * Updates the level number display.
 * @param {number} levelNumber - The current level number (1-based).
 */
export function updateLevelDisplay(levelNumber) {
    if (levelDisplayElement) {
        levelDisplayElement.textContent = `Level: ${levelNumber}`;
    }
}

/**
 * Updates the birds remaining display.
 * @param {number} count - Number of birds left.
 * @param {number} total - Total birds for the level.
 */
export function updateBirdsLeft(count, total) {
    if (birdsLeftElement) {
        birdsLeftElement.innerHTML = `Birds: ${'🐦'.repeat(count)}${' <span style="opacity:0.5">🐦</span>'.repeat(total - count)}`;
        // Add animation if needed
    }
}

/**
 * Updates the stars display in the HUD based on potential score gain.
 * (This might be called predictively or just reflect current stars)
 * @param {number} numStars - Number of stars currently earned (0-3).
 */
export function updateStars(numStars) {
    if (starsElement) {
        const starSpans = starsElement.querySelectorAll('span');
        starSpans.forEach((span, index) => {
            span.classList.toggle('active', index < numStars);
        });
    }
}

/**
 * Updates the visual state of the mute button.
 * @param {boolean} isMuted - Whether sound is currently muted.
 */
export function updateMuteButton(isMuted) {
    if (muteButton) {
        muteButton.textContent = isMuted ? '🔇' : '🔊';
        muteButton.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
    }
}

/**
 * Enables or disables the Next Level button.
 * @param {boolean} enabled - Whether the button should be enabled.
 */
export function setNextLevelButtonEnabled(enabled) {
    if (nextLevelButton) {
        console.log(`UI: Setting Next Level Button enabled=${enabled}`);
        nextLevelButton.disabled = !enabled;
    }
}

// --- Modal Dialog Functions ---

/**
 * Calculates the number of stars earned based on score and thresholds.
 * @param {number} score - The final score for the level.
 * @param {object} thresholds - The star thresholds for the level (e.g., {1: 1000, 2: 5000, 3: 10000}).
 * @returns {number} Number of stars (0-3).
 */
function calculateStars(score, thresholds) {
    if (!thresholds) return 0;
    if (score >= thresholds[3]) return 3;
    if (score >= thresholds[2]) return 2;
    if (score >= thresholds[1]) return 1;
    return 0;
}

/**
 * Shows the Level Complete dialog.
 * @param {number} score - Final score.
 * @param {object} starThresholds - Thresholds for the completed level.
 * @param {boolean} isLastLevel - Whether this was the final level available.
 */
export function showLevelCompleteDialog(score, starThresholds, isLastLevel) {
    if (levelCompleteDialog && finalScoreElement && finalStarsElement) {
        const stars = calculateStars(score, starThresholds);

        finalScoreElement.textContent = score;
        const starSpans = finalStarsElement.querySelectorAll('span');
         if (!starSpans || starSpans.length !== 3) { // Ensure spans exist or create them
             finalStarsElement.innerHTML = '<span>⭐</span><span>⭐</span><span>⭐</span>';
         }
         finalStarsElement.querySelectorAll('span').forEach((span, index) => {
            span.classList.toggle('active', index < stars);
            if (index < stars) {
                span.style.animation = `pop 0.5s ease-out ${index * 0.2}s forwards`;
            } else {
                span.style.animation = 'none';
            }
        });

        // Disable "Next Level" if it's the last one
        dialogNextLevelButton.style.display = isLastLevel ? 'none' : 'inline-block';

        levelCompleteDialog.showModal();
    }
}

/**
 * Shows the Game Over dialog.
 */
export function showGameOverDialog() {
    if (gameOverDialog) {
        gameOverDialog.showModal();
    }
}

// --- Local Storage Persistence ---

/**
 * Saves game progress (highest unlocked level, high scores).
 * @param {number} highestLevelUnlocked
 * @param {object} highScores - Optional: { levelIndex: score, ... }
 */
export function saveProgress(highestLevelUnlocked, highScores = {}) {
    try {
        const progress = {
            highestLevelUnlocked,
            highScores,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.error("Failed to save progress to localStorage:", e);
    }
}

/**
 * Loads game progress from local storage.
 * @returns {object} { highestLevelUnlocked: number, highScores: object } or defaults.
 */
export function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const progress = JSON.parse(saved);
            // Basic validation
            if (typeof progress.highestLevelUnlocked === 'number' && typeof progress.highScores === 'object') {
                 return progress;
            }
        }
    } catch (e) {
        console.error("Failed to load progress from localStorage:", e);
    }
    // Return defaults if no save data or error
    return { highestLevelUnlocked: 1, highScores: {} };
} 