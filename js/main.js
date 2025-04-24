/**
 * @fileoverview Main game logic for the Angry Birds clone.
 * Initializes the game, manages the game loop, levels, input, and UI updates.
 */

import { PhysicsWorld, Vec2, pixelsPerMeter, GRAVITY, TIME_STEP, FRICTION } from './physics.js';
import { Bird, Enemy, Block, Slingshot, LAUNCH_POWER } from './entities.js';
import { LEVELS } from './levels.js';
import { initUI, updateScore, updateBirdsLeft, updateStars, setNextLevelButtonEnabled, showLevelCompleteDialog, showGameOverDialog, saveProgress, loadProgress, updateMuteButton, updateLevelDisplay } from './ui.js';

// --- Constants & Game State ---
const DEBUG = true;
const CANVAS_ID = 'gameCanvas';
const ASSET_PATHS = {
    redbird: '/assets/redbird.webp',
    greenbird: '/assets/greenbird.png',
    // Add paths for audio files if using separate files
    // launchSound: '/assets/launch.mp3',
    // ... other sounds
};

let canvas, ctx;
let physicsWorld;
let slingshot;
let currentLevelIndex = 0;
let score = 0;
let birds = []; // Birds available for the current level
let enemies = [];
let blocks = [];
let currentBird = null; // The bird currently in the slingshot or flying
let gameState = 'loading'; // loading, ready, playing, aiming, levelComplete, gameOver
let loadedAssets = {};
let isMuted = false;
let gameProgress = { highestLevelUnlocked: 1, highScores: {} };
let lastTime = 0;
let accumulator = 0;
let levelCompleteTimer = null; // Timer ID for delayed level completion
const LEVEL_COMPLETE_DELAY = 2000; // ms delay after last enemy destroyed

// Input state
let isDragging = false;
let pointerPos = new Vec2();

// --- Asset Loading ---

/**
 * Loads all game assets (images, sounds).
 * @returns {Promise<object>} A promise that resolves with the loaded assets.
 */
export function loadAssets() {
    const promises = Object.entries(ASSET_PATHS).map(([name, src]) => {
        return new Promise((resolve, reject) => {
            if (src.endsWith('.webp') || src.endsWith('.png') || src.endsWith('.jpg')) {
                const img = new Image();
                img.onload = () => resolve({ name, asset: img });
                img.onerror = (err) => {
                    console.error(`Failed to load image: ${name} (${src})`, err);
                    reject(err);
                };
                img.src = src;
            } else if (src.endsWith('.mp3') || src.endsWith('.wav') || src.endsWith('.ogg')) {
                // Basic Audio loading (consider a more robust Audio Manager)
                const audio = new Audio();
                audio.oncanplaythrough = () => resolve({ name, asset: audio });
                audio.onerror = (err) => {
                     console.error(`Failed to load audio: ${name} (${src})`, err);
                     reject(err);
                };
                audio.src = src;
                // Resolve immediately for audio, loading happens in background
                 resolve({ name, asset: audio });
            } else {
                console.warn(`Unsupported asset type: ${src}`);
                resolve({ name, asset: null }); // Resolve successfully but with null asset
            }
        });
    });

    return Promise.all(promises).then(results => {
        const assets = {};
        results.forEach(result => {
            if (result) {
                assets[result.name] = result.asset;
            }
        });
        console.log("Assets loaded:", assets);
        return assets;
    });
}

// --- Game Initialization ---

/**
 * Initializes the game canvas, context, physics, UI, and loads the first level.
 */
async function initGame() {
    canvas = document.getElementById(CANVAS_ID);
    if (!canvas) {
        console.error(`Canvas element with ID '${CANVAS_ID}' not found.`);
        return;
    }
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D rendering context.');
        return;
    }

    // Load Progress
    gameProgress = loadProgress();
    currentLevelIndex = Math.max(0, gameProgress.highestLevelUnlocked - 1); // Start at highest unlocked or level 1
    currentLevelIndex = Math.min(currentLevelIndex, LEVELS.length - 1); // Clamp to available levels

    // Init UI (pass callbacks)
    initUI({
        restartLevel: restartCurrentLevel,
        nextLevel: loadNextLevel,
        toggleMute: toggleMute
    });

    // Load Assets
    try {
        loadedAssets = await loadAssets();
        gameState = 'ready';
    } catch (error) {
        console.error("Failed to load assets. Game cannot start.", error);
        // Display error message to user?
        gameState = 'error';
        return;
    }

    // Setup Input Listeners
    setupInputListeners();

    // Load initial level
    loadLevel(currentLevelIndex);

    // Start the game loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial resize

     console.log("Game Initialized. Starting Level:", currentLevelIndex + 1);
}

// --- Level Management ---

/**
 * Loads a specific level configuration.
 * @param {number} levelIndex - The index of the level in the LEVELS array.
 */
function loadLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= LEVELS.length) {
        console.error(`Invalid level index: ${levelIndex}`);
        // Maybe show a "Game Complete" screen?
        gameState = 'gameOver'; // Or a new 'gameComplete' state
        return;
    }

    console.log(`Loading Level ${levelIndex + 1}`);
    currentLevelIndex = levelIndex;
    const levelData = LEVELS[levelIndex];

    // Reset game state for the new level
    physicsWorld = new PhysicsWorld();
    birds = [];
    enemies = [];
    blocks = [];
    currentBird = null;
    score = 0;
    isDragging = false;
    gameState = 'ready';

    // Create Slingshot
    slingshot = new Slingshot(levelData.slingshotPos.x, levelData.slingshotPos.y);

    // Populate birds queue
    levelData.birds.forEach(birdType => {
        // For now, only 'red' bird
        if (birdType === 'red') {
            birds.push(new Bird(0, 0)); // Position set when attached to slingshot
        }
        // TODO: Add other bird types here
    });

    // Create Enemies
    levelData.enemies.forEach(enemyData => {
        const enemy = new Enemy(enemyData.x, enemyData.y);
        enemies.push(enemy);
        physicsWorld.addEntity(enemy);
    });

    // Create Blocks
    levelData.blocks.forEach(blockData => {
        const block = new Block(blockData.x, blockData.y, blockData.width, blockData.height, blockData.type, blockData.isStatic);
        blocks.push(block);
        physicsWorld.addEntity(block);
    });

    // --- Force initial sleep state for stability ---
    physicsWorld.entities.forEach(entity => {
        // Revert: Put all non-static, sleepable entities to sleep initially.
        if (!entity.isStatic && entity.canSleep) { 
            entity.isSleeping = true;
            entity.velocity = Vec2.zero();
        }
    });
    // -----------------------------------------------

    // Update UI
    updateScore(score);
    updateBirdsLeft(birds.length, birds.length);
    updateStars(0); // Reset stars for the level
    updateLevelDisplay(currentLevelIndex + 1);
    // Enable if the next level exists AND is unlocked
    const nextLevelIndex = currentLevelIndex + 1;
    setNextLevelButtonEnabled(nextLevelIndex < LEVELS.length && nextLevelIndex < gameProgress.highestLevelUnlocked);

    // Prepare the first bird
    prepareNextBird();

    resetLevelCompleteTimer(); // Reset timer when loading a new level
}

function restartCurrentLevel() {
    console.log("Restarting Level");
    resetLevelCompleteTimer(); // Reset timer on restart
    loadLevel(currentLevelIndex);
}

function loadNextLevel() {
     if (currentLevelIndex < LEVELS.length - 1) {
        console.log("Loading Next Level");
        loadLevel(currentLevelIndex + 1);
    } else {
        console.log("No more levels!");
        // TODO: Show Game Complete screen
    }
}

/** Attaches the next available bird to the slingshot */
function prepareNextBird() {
    if (birds.length > 0) {
        currentBird = birds.shift(); // Get the next bird from the queue
        slingshot.attachBird(currentBird);
        physicsWorld.addEntity(currentBird); // Add to physics ONLY when it's active
        gameState = 'ready'; // Ready to aim
        updateBirdsLeft(birds.length + (currentBird ? 1 : 0), LEVELS[currentLevelIndex].birds.length);
    } else {
        currentBird = null;
        // Check if level should end (no birds left, but enemies might still be falling)
        // The check for level end condition is handled in the game loop update.
         updateBirdsLeft(0, LEVELS[currentLevelIndex].birds.length);
         console.log("No birds left in queue");
    }
}

// --- Game Loop ---

/**
 * The main game loop, called via requestAnimationFrame.
 * @param {DOMHighResTimeStamp} currentTime - The current time.
 */
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000; // Delta time in seconds
    lastTime = currentTime;
    accumulator += deltaTime;

    // Fixed timestep update for physics
    while (accumulator >= TIME_STEP) {
        update(TIME_STEP);
        accumulator -= TIME_STEP;
    }

    render();

    // Continue the loop
    if (gameState !== 'error') {
        requestAnimationFrame(gameLoop);
    }
}

// --- Update Logic ---

/**
 * Updates the game state for a fixed time step.
 * @param {number} dt - The fixed delta time (TIME_STEP).
 */
function update(dt) {
    if (gameState === 'playing' || gameState === 'aiming') {
        physicsWorld.update(dt);

        // Update entity logic (like bird lifespan)
        if (currentBird) currentBird.update(dt);
        enemies.forEach(e => e.update(dt));
        blocks.forEach(b => b.update(dt));

        // Handle entity removal and score updates
        cleanupEntities();

        // Check win/loss conditions
        checkLevelEndConditions();
    }
     // If aiming, update bird position based on pointer
     if (gameState === 'aiming' && isDragging && currentBird && slingshot) {
        slingshot.updateAim(pointerPos);
    }
}

/** Removes entities marked for removal and updates score */
function cleanupEntities() {
    let scoreToAdd = 0;
    const outOfBoundsY = canvas.height + 100; // Define a lower boundary

    const checkAndRemove = (entityArray) => {
        for (let i = entityArray.length - 1; i >= 0; i--) {
            const entity = entityArray[i];

            // Remove if marked or if fallen out of bounds
            if (entity.markedForRemoval || entity.position.y > outOfBoundsY) {
                // Add a console log for debugging out-of-bounds removal
                if (entity.position.y > outOfBoundsY) {
                    console.log(`Removing ${entity.constructor.name} at ${entity.position.y} (out of bounds)`);
                }

                physicsWorld.removeEntity(entity);
                if (entity.scoreValue && entity.markedForRemoval) { // Only score if marked (not just out of bounds)
                    scoreToAdd += entity.scoreValue;
                    // TODO: Play destruction sound
                }
                entityArray.splice(i, 1);
                // Special handling for the current bird being removed
                if (entity === currentBird) {
                    currentBird = null;
                    // Delay slightly before preparing next bird to let physics settle
                    setTimeout(prepareNextBird, 500);
                }
            }
        }
    };

    checkAndRemove(enemies);
    checkAndRemove(blocks); // Check blocks too, although dynamic ones shouldn't fall off usually
    if (currentBird && (currentBird.markedForRemoval || currentBird.position.y > outOfBoundsY)) {
        // Add a console log for debugging out-of-bounds removal
        if (currentBird.position.y > outOfBoundsY) {
            console.log(`Removing currentBird at ${currentBird.position.y} (out of bounds)`);
        }
        physicsWorld.removeEntity(currentBird);
        currentBird = null;
        setTimeout(prepareNextBird, 500);
    }

    if (scoreToAdd > 0) {
        score += scoreToAdd;
        updateScore(score);
        // TODO: Add score animation/popup
    }
}

/** Resets the level complete timer */
function resetLevelCompleteTimer() {
    if (levelCompleteTimer !== null) {
        clearTimeout(levelCompleteTimer);
        levelCompleteTimer = null;
    }
}

/** Checks if the level is won or lost */
function checkLevelEndConditions() {
    // --- Win Condition Check ---
    if (enemies.length === 0 && (gameState === 'playing' || gameState === 'ready')) {
        // Check if physics has settled OR player has no more moves
        const physicsSettled = physicsWorld.entities.every(e => e.isStatic || e.isSleeping || e.markedForRemoval);
        const noMoreActionsPossible = !currentBird && birds.length === 0;

        // Add specific logging for Level 8 (index 7)
        if (currentLevelIndex === 7) {
            console.log(`L8 Check: Enemies=${enemies.length}, Settled=${physicsSettled}, NoMoreActions=${noMoreActionsPossible}, Timer=${levelCompleteTimer}, State=${gameState}`);
        }

        // Condition 1: Immediate win if everything is settled OR no birds left
        if (physicsSettled || noMoreActionsPossible) {
            if (gameState !== 'levelComplete') { // Prevent multiple triggers
                console.log("Level Complete! Condition met (Settled or No Birds Left).");
                triggerLevelComplete();
            }
        } 
        // Condition 2: Start a timer if enemies are gone but things might still be settling
        else if (levelCompleteTimer === null) { 
            console.log("Enemies gone, starting level complete timer...");
            levelCompleteTimer = setTimeout(() => {
                // Add specific logging for Level 8 timer fire
                if (currentLevelIndex === 7) {
                     console.log(`L8 Timer Fired: Enemies=${enemies.length}, gameState=${gameState}`);
                }
                // Re-check enemy count after delay, in case something weird happened
                if (enemies.length === 0 && gameState !== 'levelComplete') { 
                    console.log("Level Complete! Timer expired.");
                    triggerLevelComplete();
                }
            }, LEVEL_COMPLETE_DELAY);
        }
    } else {
        // If enemies reappear (shouldn't happen, but safety), cancel the timer
        resetLevelCompleteTimer();
    }

    // --- Lose Condition Check ---
    if (birds.length === 0 && !currentBird && enemies.length > 0 && gameState === 'playing') {
         // Ensure all physics activity has settled down before declaring game over
        const allSleeping = physicsWorld.entities.every(e => e.isStatic || e.isSleeping || e.markedForRemoval);

         if (allSleeping) {
            resetLevelCompleteTimer(); // Ensure win timer is cleared if we lose
            if (gameState !== 'gameOver') { // Prevent multiple triggers
                gameState = 'gameOver';
                console.log("Game Over!");
                showGameOverDialog();
            }
        }
    }
}

/** Contains the logic to execute when a level is won */
function triggerLevelComplete() {
    resetLevelCompleteTimer(); // Clear timer just in case
    gameState = 'levelComplete';

    // Add bonus for remaining birds (will be 0 if noMoreActionsPossible triggered it)
    score += birds.length * 10000;
    // if (currentBird) score += 10000; // This check becomes redundant if noMoreActionsPossible triggers the win

    updateScore(score);
    // Update high score if needed
    const currentHighScore = gameProgress.highScores[currentLevelIndex] || 0;
    if (score > currentHighScore) {
        gameProgress.highScores[currentLevelIndex] = score;
    }
    // Unlock next level
    const nextLevel = currentLevelIndex + 1;
    if (nextLevel < LEVELS.length && nextLevel + 1 > gameProgress.highestLevelUnlocked) {
         gameProgress.highestLevelUnlocked = nextLevel + 1;
    }
    saveProgress(gameProgress.highestLevelUnlocked, gameProgress.highScores);

    setNextLevelButtonEnabled(currentLevelIndex < LEVELS.length - 1);
    showLevelCompleteDialog(score, LEVELS[currentLevelIndex].starThresholds, currentLevelIndex === LEVELS.length - 1);

}

// --- Rendering ---

/**
 * Renders the current game state to the canvas.
 */
function render() {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (simple sky blue for now)
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground (use the static ground block if available)
    const ground = blocks.find(b => b.isStatic && b.position.y > canvas.height / 2); // Simple ground check
    if (ground) {
        ground.draw(ctx); // Draw ground first
    } else {
        // Fallback ground drawing
        ctx.fillStyle = '#a0522d'; // Sienna
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    }

    // Draw entities (blocks first, then enemies, then bird)
    blocks.forEach(block => { if (!block.isStatic) block.draw(ctx, loadedAssets); }); // Draw dynamic blocks
    enemies.forEach(enemy => enemy.draw(ctx, loadedAssets));

    // Draw slingshot FIRST, so trajectory is behind it
    if (slingshot) slingshot.draw(ctx);

    // Draw trajectory line if aiming (Using step-by-step simulation matching physics engine)
    if (gameState === 'aiming' && currentBird && slingshot) {
        const launchVelRaw = slingshot.getLaunchVelocity(); // Get raw, unscaled velocity
        if (launchVelRaw.lenSq() > 0) {
            const trajectoryStartPos = slingshot.getLaunchOrigin(); // Use bird's actual launch point
            // Simulate trajectory using the exact same physics steps
            // Scale the velocity here before passing to the predictor
            const launchVelScaled = launchVelRaw.mul(LAUNCH_POWER);
            const trajectoryPoints = simulateTrajectory(trajectoryStartPos, launchVelScaled);
            drawGuide(ctx, trajectoryPoints); // Use the same drawing function
        }
    }

    // Draw the aiming bird LAST so it's on top of the trajectory and slingshot bands
    if (currentBird && !currentBird.markedForRemoval) currentBird.draw(ctx, loadedAssets);

    // --- DEBUG: Draw actual path --- START
    if (DEBUG && currentBird && currentBird.pastPositions && currentBird.pastPositions.length > 0) {
        ctx.fillStyle = 'magenta';
        currentBird.pastPositions.forEach(p =>
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
        );
    }
    // --- DEBUG: Draw actual path --- END

    // Draw debug info (optional)
    // drawDebugInfo(); // Temporarily disable if it obscures things
}

/**
 * Simulates the trajectory step-by-step, mirroring the core physics loop.
 * Ensures the prediction uses the exact same constants and logic (including friction).
 * @param {Vec2} startPos - Starting position {x, y}.
 * @param {Vec2} startVel - Initial velocity {x, y}.
 * @param {number} steps - Maximum number of physics steps to simulate.
 * @returns {Array<{x: number, y: number}>} Array of points along the path.
 */
function simulateTrajectory(startPos, startVel, steps = 150) { // Steps = duration / TIME_STEP
    const pts = [ { x: startPos.x, y: startPos.y } ]; // Start with the initial position
    const dt = TIME_STEP; // Use the exact physics time step
    let currentPos = startPos; // No clone needed for immutable Vec2
    let currentVel = startVel; // No clone needed for immutable Vec2
    const groundY = canvas.height - 50; // Approximate ground level

    // Pre-calculate gravity force per step for efficiency
    const gravityForce = new Vec2(0, GRAVITY * dt);

    for (let i = 0; i < steps; i++) {
        // --- Mirror PhysicsWorld.applyForces --- START
        // Apply gravity
        currentVel = currentVel.add(gravityForce);
        // Apply linear damping (friction)
        currentVel = currentVel.mul(FRICTION);
        // --- Mirror PhysicsWorld.applyForces --- END

        // --- Mirror PhysicsWorld.integrate --- START
        currentPos = currentPos.add(currentVel.mul(dt));
        // --- Mirror PhysicsWorld.integrate --- END

        // Add point every few steps for visual clarity
        if (i % 3 === 0) { // Adjust frequency as needed
             pts.push({ x: currentPos.x, y: currentPos.y });
        }

        // Stop if it hits the ground (basic check)
        if (currentPos.y > groundY) {
             // Optional: Add last point at ground intersection
             if (pts.length === 0 || pts[pts.length - 1].y < groundY) {
                 pts.push({ x: currentPos.x, y: groundY });
             }
             break;
        }

        // Stop if trajectory goes way off screen
        if (currentPos.x < -100 || currentPos.x > canvas.width + 100) {
            break;
        }
    }
    // Ensure the very first point is included if simulation was very short
    // NO LONGER NEEDED: if (pts.length === 0) pts.push({ x: startPos.x, y: startPos.y });

    return pts;
}

/**
 * Draws a dotted line guide based on sampled trajectory points.
 * @param {CanvasRenderingContext2D} ctx - The canvas context.
 * @param {Array<{x: number, y: number}>} points - The points to draw.
 */
function drawGuide(ctx, points) {
    if (points.length < 2) return;

    ctx.save();
    ctx.setLineDash([4, 6]); // Dash pattern: 4px line, 6px gap
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White with transparency

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.restore(); // Restores line dash, lineWidth, strokeStyle
}

/** DEBUG: Draw physics outlines */
// function drawDebugInfo() { ... } // Keep this function if needed, just commented out call in render

// --- Input Handling ---

/** Sets up mouse and touch event listeners */
function setupInputListeners() {
    // Mouse events
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave); // Handle pointer leaving canvas

    // Keyboard events
    window.addEventListener('keydown', handleKeyDown);
}

function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    // Adjust for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return new Vec2(
        (event.clientX - rect.left) * scaleX,
        (event.clientY - rect.top) * scaleY
    );
}

function handlePointerDown(event) {
     if (gameState !== 'ready' || !currentBird) return;

    pointerPos = getPointerPosition(event);
    if (slingshot.startAim(pointerPos)) {
        isDragging = true;
        gameState = 'aiming';
         canvas.style.cursor = 'grabbing';
    }
}

function handlePointerMove(event) {
    if (!isDragging || gameState !== 'aiming') return;
    pointerPos = getPointerPosition(event);
    // Aim update happens in the update() function based on pointerPos
}

function handlePointerUp(event) {
    if (!isDragging || gameState !== 'aiming') return;

    pointerPos = getPointerPosition(event);
    if (slingshot.endAim()) {
        gameState = 'playing'; // Bird is launched
        currentBird.canSleep = true; // Allow bird to sleep after launch
        // currentBird reference is kept until it's destroyed or next bird prepared
    }
    isDragging = false;
    canvas.style.cursor = 'grab';

    // Don't immediately prepare next bird here, wait for the launched bird to land/disappear
}

function handlePointerLeave(event) {
    // If dragging and pointer leaves, treat it as releasing the slingshot
    if (isDragging && gameState === 'aiming') {
         console.log("Pointer left canvas while aiming, launching.");
        handlePointerUp(event);
    }
}

function handleKeyDown(event) {
    if (event.key === 'r' || event.key === 'R') {
        if (gameState !== 'levelComplete' && gameState !== 'gameOver') {
            actions.restartLevel();
        }
    }
    if (event.key === 'n' || event.key === 'N') {
        // Only allow next level if button is enabled (i.e., level unlocked)
        if (!nextLevelButton.disabled && gameState !== 'playing' && gameState !== 'aiming') {
            actions.nextLevel();
        }
    }
    // Add other keyboard shortcuts if needed (e.g., panning with arrows)
}

// --- Canvas Resizing ---

/** Resizes the canvas to fit the window while maintaining aspect ratio */
function resizeCanvas() {
    const aspectRatio = 16 / 9; // Game aspect ratio (1280 / 720)
    const container = document.getElementById('game-container');
    const parentWidth = container.clientWidth;
    const parentHeight = container.clientHeight;

    let newWidth = parentWidth;
    let newHeight = parentWidth / aspectRatio;

    if (newHeight > parentHeight) {
        newHeight = parentHeight;
        newWidth = parentHeight * aspectRatio;
    }

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // We keep the internal resolution fixed (1280x720) and let CSS handle scaling
    // canvas.width = 1280;
    // canvas.height = 720;
}

// --- Sound Management ---

function playSound(soundName) {
    if (!isMuted && loadedAssets[soundName]) {
        // Basic sound playback (reset time for overlapping sounds)
        loadedAssets[soundName].currentTime = 0;
        loadedAssets[soundName].play().catch(e => console.warn(`Sound playback error for ${soundName}:`, e));
    } else if (!loadedAssets[soundName]){
         console.warn(`Sound asset not found: ${soundName}`);
    }
}

function toggleMute() {
    isMuted = !isMuted;
    console.log(`Sound ${isMuted ? 'Muted' : 'Unmuted'}`);
    updateMuteButton(isMuted);
    // Optionally stop all currently playing sounds if muted
    // if (isMuted) { ... stop sounds ... }
    return isMuted;
}

// --- Start the Game ---
document.addEventListener('DOMContentLoaded', initGame); 