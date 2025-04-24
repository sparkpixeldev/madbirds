/**
 * @fileoverview Level definitions for the game.
 * Each level object contains arrays of entities to spawn.
 */

const CANVAS_HEIGHT = 720;
const GROUND_LEVEL = CANVAS_HEIGHT - 50; // Assuming a ground level for placement

// Need to define ENEMY_RADIUS here or import it, let's define it locally for simplicity
const ENEMY_RADIUS = 25; // Must match the value in entities.js

export const LEVELS = [
    // Level 1: Simple structure
    {
        level: 1,
        birds: ['red', 'red'], // Types of birds available
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            { type: 'enemy', x: 800, y: GROUND_LEVEL - ENEMY_RADIUS - 1 }, // Spawn slightly above ground
        ],
        blocks: [
            // Base platform
            { type: 'wood', x: 750, y: GROUND_LEVEL - 80, width: 100, height: 20 },
            { type: 'wood', x: 775, y: GROUND_LEVEL - 140, width: 50, height: 60 },
            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 1000, 2: 7000, 3: 10000 } // Score thresholds for stars
    },

    // Level 2: Small tower
    {
        level: 2,
        birds: ['red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            { type: 'enemy', x: 850, y: GROUND_LEVEL - ENEMY_RADIUS - 1 }, // On ground
            { type: 'enemy', x: 850, y: GROUND_LEVEL - 90 - ENEMY_RADIUS - 1 }, 
        ],
        blocks: [
            // Tower structure
            { type: 'wood', x: 800, y: GROUND_LEVEL - 40, width: 100, height: 20 },
            { type: 'glass', x: 900, y: GROUND_LEVEL - 40, width: 100, height: 20 },
            { type: 'wood', x: 850, y: GROUND_LEVEL - 80, width: 100, height: 20 },
            { type: 'glass', x: 825, y: GROUND_LEVEL - 120, width: 50, height: 40 },
            { type: 'glass', x: 875, y: GROUND_LEVEL - 120, width: 50, height: 40 },
            { type: 'wood', x: 850, y: GROUND_LEVEL - 160, width: 100, height: 20 },
             // Ground block
             { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 5000, 2: 12000, 3: 18000 }
    },

    // Level 3: More complex structure with stone
    {
        level: 3,
        birds: ['red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            { type: 'enemy', x: 750, y: GROUND_LEVEL - ENEMY_RADIUS - 1 }, // On ground
            { type: 'enemy', x: 950, y: GROUND_LEVEL - ENEMY_RADIUS - 1 }, // On ground
            { type: 'enemy', x: 850, y: GROUND_LEVEL - 210 - ENEMY_RADIUS - 1 },
        ],
        blocks: [
            // Left support
            { type: 'stone', x: 700, y: GROUND_LEVEL - 100, width: 20, height: 100 },
            { type: 'wood', x: 700, y: GROUND_LEVEL - 120, width: 100, height: 20 },
            // Right support
            { type: 'stone', x: 1000, y: GROUND_LEVEL - 100, width: 20, height: 100 },
            { type: 'wood', x: 920, y: GROUND_LEVEL - 120, width: 100, height: 20 },
            // Center platform
            { type: 'glass', x: 800, y: GROUND_LEVEL - 80, width: 120, height: 20 },
            { type: 'wood', x: 810, y: GROUND_LEVEL - 120, width: 100, height: 20 },
            { type: 'stone', x: 850, y: GROUND_LEVEL - 180, width: 20, height: 60 }, // Vertical stone
             // Ground block
             { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 10000, 2: 20000, 3: 28000 }
    },

    /* ----------  LEVEL 4 : "Glass Castle"  ---------- */
    {
        level: 4,
        birds: ['red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 880, y: GROUND_LEVEL - ENEMY_RADIUS - 1 },
            { type:'enemy', x: 880, y: GROUND_LEVEL - 90  - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Glass base
            { type:'glass', x: 830, y: GROUND_LEVEL - 40, width: 100, height: 20 },
            { type:'glass', x: 930, y: GROUND_LEVEL - 40, width: 100, height: 20 },
            // Middle span
            { type:'glass', x: 880, y: GROUND_LEVEL - 80, width: 120, height: 20 },
            // Pillars
            { type:'glass', x: 830, y: GROUND_LEVEL - 120, width: 20, height: 60 },
            { type:'glass', x: 930, y: GROUND_LEVEL - 120, width: 20, height: 60 },
            // Roof
            { type:'glass', x: 880, y: GROUND_LEVEL - 160, width: 120, height: 20 },

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 7000, 2: 15000, 3: 23000 }
    },

    /* ----------  LEVEL 5 : "See-Saw"  ---------- */
    {
        level: 5,
        birds: ['red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 830, y: GROUND_LEVEL - 110 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Central stone pivot
            { type:'stone', x: 830, y: GROUND_LEVEL - 70, width: 40, height: 40 },
            // Wooden plank on top (fulcrum)
            { type:'wood' , x: 830, y: GROUND_LEVEL - 100, width: 200, height: 20 },
            // Glass weights at ends
            { type:'glass', x: 730, y: GROUND_LEVEL - 120, width: 40, height: 40 },
            { type:'glass', x: 930, y: GROUND_LEVEL - 120, width: 40, height: 40 },

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 8000, 2: 17000, 3: 26000 }
    },

    /* ----------  LEVEL 6 : "Twin Towers"  ---------- */
    {
        level: 6,
        birds: ['red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 760, y: GROUND_LEVEL - 110 - ENEMY_RADIUS - 1 },
            { type:'enemy', x: 1000, y: GROUND_LEVEL - 110 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Left tower (wood)
            { type:'wood', x: 720, y: GROUND_LEVEL -  40, width:  20, height: 80 },
            { type:'wood', x: 760, y: GROUND_LEVEL -  40, width:  20, height: 80 },
            { type:'wood', x: 740, y: GROUND_LEVEL - 100, width:  60, height: 20 },
            // Right tower (glass)
            { type:'glass', x: 960, y: GROUND_LEVEL -  40, width:  20, height: 80 },
            { type:'glass', x:1000, y: GROUND_LEVEL -  40, width:  20, height: 80 },
            { type:'glass', x: 980, y: GROUND_LEVEL - 100, width:  60, height: 20 },

            // Shared stone roof
            { type:'stone', x: 860, y: GROUND_LEVEL - 140, width: 240, height: 20 },

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 10000, 2: 20000, 3: 30000 }
    },

    /* ----------  LEVEL 7 : "Domino Alley"  ---------- */
    {
        level: 7,
        birds: ['red','red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 1010, y: GROUND_LEVEL - 120 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Ten slim stone dominoes 60 px apart
            ...Array.from({length:10}, (_,i)=>({
                type:'stone',
                x: 400 + i*60,
                y: GROUND_LEVEL - 80,
                width: 20,
                height: 60
            })),

            // Enemy sits at end on glass pedestal
            { type:'glass', x: 1010, y: GROUND_LEVEL - 100, width: 40, height: 40 },

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 9000, 2: 18000, 3: 26000 }
    },

    /* ----------  LEVEL 8 : "Pit-Stop"  ---------- */
    {
        level: 8,
        birds: ['red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            // Corrected Enemy Y: platform_center_y (G-161) - platform_half_h (10) - ENEMY_RADIUS - 1px gap
            { type:'enemy', x: 880, y: GROUND_LEVEL - 171 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Vertical pit walls (Supports)
            { type:'stone', x: 790, y: GROUND_LEVEL -  80, width: 20, height: 100 }, // Top edge at G - 130
            { type:'stone', x: 970, y: GROUND_LEVEL -  80, width: 20, height: 100 }, // Top edge at G - 130
            // Bridge over pit (wood) - Corrected Y to sit on walls (Bottom edge at G-131)
            { type:'wood' , x: 880, y: GROUND_LEVEL - 141, width: 200, height: 20 },
            // Enemy platform above - Corrected Y to sit on bridge (Bottom edge at G-151)
            { type:'glass', x: 880, y: GROUND_LEVEL - 161, width: 140, height: 20 },

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 11000, 2: 22000, 3: 34000 }
    },

    /* ----------  LEVEL 9 : "Stonehenge"  ---------- */
    {
        level: 9,
        birds: ['red','red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 860, y: GROUND_LEVEL - 150 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Uprights
            { type:'stone', x: 770, y: GROUND_LEVEL - 100, width: 20, height: 100 },
            { type:'stone', x: 950, y: GROUND_LEVEL - 100, width: 20, height: 100 },
            // Capstone
            { type:'stone', x: 860, y: GROUND_LEVEL - 160, width: 200, height: 20 },
            // Enemy platform (glass, fragile)
            { type:'glass', x: 860, y: GROUND_LEVEL - 140, width: 120, height: 20 },

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 12000, 2: 25000, 3: 37000 }
    },

    /* ----------  LEVEL 10 : "Stack Attack"  ---------- */
    {
        level: 10,
        birds: ['red','red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 850, y: GROUND_LEVEL - 250 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Five-layer alternating stack  (glass-wood-stone-wood-glass)
            ...Array.from({length:5}, (_,i)=>({
                type: ['glass','wood','stone','wood','glass'][i],
                x: 850,
                y: GROUND_LEVEL - 40 - i*50,
                width: 200 - i*20,
                height: 20
            })),

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 15000, 2: 30000, 3: 45000 }
    },

    /* ----------  LEVEL 11 : "Catapult Counter"  ---------- */
    {
        level: 11,
        birds: ['red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 980, y: GROUND_LEVEL - 170 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Long plank resting on left glass cube → lever
            { type:'glass', x: 760, y: GROUND_LEVEL -  60, width: 40, height: 40 },
            { type:'wood' , x: 860, y: GROUND_LEVEL - 100, width: 240, height: 20 },

            // Right-side counterweight (stone)
            { type:'stone', x: 980, y: GROUND_LEVEL - 140, width: 60, height: 60 },

            // Enemy atop the stone weight (already positioned)

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 14000, 2: 28000, 3: 42000 }
    },

    /* ----------  LEVEL 12 : "Glass & Grass"  ---------- */
    {
        level: 12,
        birds: ['red','red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 780, y: GROUND_LEVEL - 92 - ENEMY_RADIUS - 1 },
            { type:'enemy', x: 940, y: GROUND_LEVEL - 92 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Gentle arc of individual glass blocks
            ...Array.from({length:9}, (_,i)=>({
                type:'glass',
                x: 700 + i*40,
                y: GROUND_LEVEL - 40 - Math.sin(i/8*Math.PI)*60,
                width: 40,
                height: 20
            })),

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 16000, 2: 32000, 3: 48000 }
    },

    /* ----------  LEVEL 13 : "Fort Knox"  ---------- */
    {
        level: 13,
        birds: ['red','red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },

        enemies: [
            { type:'enemy', x: 860, y: GROUND_LEVEL - 300 - ENEMY_RADIUS - 1 },
        ],

        blocks: [
            // Outer stone walls
            { type:'stone', x: 720, y: GROUND_LEVEL - 100, width: 20, height: 200 },
            { type:'stone', x:1000, y: GROUND_LEVEL - 100, width: 20, height: 200 },
            // Floors
            { type:'wood' , x: 860, y: GROUND_LEVEL -  40, width: 300, height: 20 },
            { type:'wood' , x: 860, y: GROUND_LEVEL - 140, width: 300, height: 20 },
            // Roof
            { type:'stone', x: 860, y: GROUND_LEVEL - 240, width: 320, height: 20 },
            // Central treasure tower (glass)
            { type:'glass', x: 860, y: GROUND_LEVEL - 280, width: 100, height: 40 },

            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],

        starThresholds: { 1: 20000, 2: 40000, 3: 60000 }
    },

    /* ----------  LEVEL 13 : "Triple Stack"  ---------- */
    {
        level: 13,
        birds: ['red','red','red','red','red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            { type:'enemy', x: 850, y: GROUND_LEVEL -  90 - ENEMY_RADIUS - 1 },
            { type:'enemy', x: 850, y: GROUND_LEVEL - 190 - ENEMY_RADIUS - 1 },
            { type:'enemy', x: 850, y: GROUND_LEVEL - 290 - ENEMY_RADIUS - 1 },
        ],
        blocks: [
             // Three stacked towers
            { type:'wood', x: 850, y: GROUND_LEVEL -  40, width: 100, height: 20 },
            { type:'glass',x: 850, y: GROUND_LEVEL -  80, width:  20, height: 40 },
            { type:'wood', x: 850, y: GROUND_LEVEL - 140, width: 100, height: 20 },
            { type:'glass',x: 850, y: GROUND_LEVEL - 180, width:  20, height: 40 },
            { type:'wood', x: 850, y: GROUND_LEVEL - 240, width: 100, height: 20 },
            { type:'glass',x: 850, y: GROUND_LEVEL - 280, width:  20, height: 40 },
            // Ground
            { type:'stone', x:0, y:GROUND_LEVEL, width:1280, height:50, isStatic:true },
        ],
        starThresholds: { 1: 15000, 2: 30000, 3: 45000 }
    },

    /* ---------- LEVEL 14: “Broken Bridge” ---------- */
    {
        level: 14,
        birds: ['red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // Enemy on fragile glass plate bridging the gap, supported by right pier
            // Glass plate Y: GROUND_LEVEL - 140 (center)
            { type: 'enemy', x: 880, y: GROUND_LEVEL - 140 - (20/2) - ENEMY_RADIUS - 1 }, // y = GL-140-10-25-1 = GL-176
        ],
        blocks: [
            // Left pier
            { type: 'stone', x: 700, y: GROUND_LEVEL - (120/2), width: 20, height: 120 }, // Base at GL
            { type: 'wood', x: 750 + (100/2), y: GROUND_LEVEL - 100 - (20/2), width: 100, height: 20 }, // Roadway segment
            // Right pier (identical structure, different x)
            { type: 'stone', x: 940, y: GROUND_LEVEL - (120/2), width: 20, height: 120 }, // Base at GL
            { type: 'wood', x: 940 + (100/2), y: GROUND_LEVEL - 100 - (20/2), width: 100, height: 20 }, // Roadway segment
            // Fragile glass plate (bridging the gap, sits on right pier's roadway)
            // Plate Y should align with roadway Y = GL - 110
            // Enemy description puts it at GL-140 center? Let's use that.
            { type: 'glass', x: 880, y: GROUND_LEVEL - 140, width: 120, height: 20 }, // Width 120, x=880 centers it between 820 and 940.

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 12000, 2: 24000, 3: 36000 }
    },

    /* ---------- LEVEL 15: “TNT Alley” ---------- */
    {
        level: 15,
        birds: ['red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
             // On low glass pedestal at end
             // Pedestal Y = GL-100 center. Enemy Y = GL-100 - 20/2 - ER - 1 = GL-136
            { type: 'enemy', x: 900, y: GROUND_LEVEL - 100 - (40/2) - ENEMY_RADIUS - 1 } // Corrected y = GL-100-20-25-1 = GL - 146
        ],
        blocks: [
            // Ten stone dominoes (20x60) spaced 50 px apart (center-to-center), start x=420.
            // Dominoes are 20 wide, gap is 30. Center spacing is 50.
            ...Array.from({ length: 10 }, (_, i) => ({
                type: 'stone',
                x: 420 + i * 50,
                y: GROUND_LEVEL - (60/2), // Center Y
                width: 20,
                height: 60
            })),
            // Three TNT crates (40x40) on alternate domino tops (1st, 3rd, 5th?)
            // TNT Block needs implementation in entities.js/physics.js for explosion
            // Domino 1 (idx 0) x=420, top y = GL-60
            // Domino 3 (idx 2) x=520, top y = GL-60
            // Domino 5 (idx 4) x=620, top y = GL-60
            { type: 'tnt', x: 420, y: GROUND_LEVEL - 60 - (40/2), width: 40, height: 40, }, // TNT on 1st domino (idx 0)
            { type: 'tnt', x: 520, y: GROUND_LEVEL - 60 - (40/2), width: 40, height: 40, }, // TNT on 3rd domino (idx 2)
            { type: 'tnt', x: 620, y: GROUND_LEVEL - 60 - (40/2), width: 40, height: 40, }, // TNT on 5th domino (idx 4)
            // Enemy pedestal (low glass)
            { type: 'glass', x: 900, y: GROUND_LEVEL - 100, width: 40, height: 40 },

             // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 14000, 2: 30000, 3: 46000 },
        notes: "Requires TNT block implementation for explosions."
    },

    /* ---------- LEVEL 16: “Tilted Tower” ---------- */
    {
        level: 16,
        birds: ['red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // Inside tower, between layer 3 and 4. Enemy Y approx GL - 180 - ER - 1
            // Layer 3 top Y = GL - 40 - 20*3 - 5*3 = GL - 115? Needs check.
            // Enemy description Y: GL - 180 - ER - 1 = GL - 206
             { type: 'enemy', x: 830, y: GROUND_LEVEL - 180 - ENEMY_RADIUS - 1 } // Use description y = GL-206
        ],
        blocks: [
            // Base block (index 0)
            { type: 'wood', x: 780, y: GROUND_LEVEL - (20/2), width: 100, height: 20 }, // Bottom Y = GL
            // Five stacked wood blocks (100x20) with 5° rightward offset (+10 x shift per layer)
            // Assuming offset affects center x
            ...Array.from({ length: 5 }, (_, i) => ({
                type: 'wood',
                x: 780 + (i + 1) * 10, // Shift center x rightwards
                y: GROUND_LEVEL - 20 - (i * 20) - (20/2), // Stacked: layer i starts at y=GL-20-i*20
                width: 100,
                height: 20,
                // angle: 5 * (Math.PI / 180) // Small angle might be unstable, layout shift preferred
            })),
            // Stone counter-weight (60x60) on top of 5th block (index 4)
            // Top of 5th block (i=4) center Y = GL - 20 - 4*20 - 10 = GL - 110
            // Top surface Y = GL - 110 - 10 = GL - 120
            // Weight center Y = GL - 120 - 60/2 = GL - 150
            // Weight center X = 780 + 5*10 = 830
            { type: 'stone', x: 830, y: GROUND_LEVEL - 150, width: 60, height: 60 },

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 17000, 2: 34000, 3: 51000 }
    },

    /* ---------- LEVEL 17: “Suspension Hazard” ---------- */
    {
        level: 17,
        birds: ['red', 'red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // Left enemy on roadway at support column x=770
            // Roadway center Y = GL - 160. Top surface = GL - 160 - 10 = GL - 170
            // Enemy Y = GL - 170 - ER - 1 = GL - 196
            { type: 'enemy', x: 770, y: GROUND_LEVEL - 170 - ENEMY_RADIUS - 1 },
            // Right enemy on roadway at support column x=950
            { type: 'enemy', x: 950, y: GROUND_LEVEL - 170 - ENEMY_RADIUS - 1 },
        ],
        blocks: [
            // Faking suspension with two vertical glass "cables" (10x140)
            // Roadway center Y = GL - 160. Bottom surface = GL - 160 + 10 = GL - 150
            // Cable center Y = GL - 150 + 140/2 = GL - 80? Let's place them so top aligns with roadway bottom.
            // Cable top Y = GL - 150. Cable center Y = GL - 150 - 140/2 = GL - 220. Seems too high.
            // Let's place cable base on ground. Center Y = GL - 140/2 = GL - 70.
            // Left cable
            { type: 'glass', x: 770, y: GROUND_LEVEL - 70, width: 10, height: 140 },
            // Right cable
            { type: 'glass', x: 950, y: GROUND_LEVEL - 70, width: 10, height: 140 },
            // Wood roadway (220x20) centered at (860, GL-160), resting on cables
            // Check: Cable top Y = GL - 70 + 70 = GL. Roadway bottom must be > GL.
            // Let's adjust: Cables support the roadway from below.
            // Roadway bottom Y = GL - 160 + 10 = GL - 150.
            // Cables should go from Ground up to GL - 150. Height = 150.
            // Cable center Y = GL - 150/2 = GL - 75.
            { type: 'glass', x: 770, y: GROUND_LEVEL - 75, width: 10, height: 150 }, // Adjusted height
            { type: 'glass', x: 950, y: GROUND_LEVEL - 75, width: 10, height: 150 }, // Adjusted height
            // Roadway
            { type: 'wood', x: 860, y: GROUND_LEVEL - 160, width: 220, height: 20 },

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 20000, 2: 40000, 3: 60000 },
        notes: "Suspension faked with glass columns. Joint physics not implemented."
    },

    /* ---------- LEVEL 18: “Wrecking Pendulum” ---------- */
    {
        level: 18,
        birds: ['red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
             // Assuming enemy is inside or on top of the house. Let's place on top.
             // House top approx GL - 50? Enemy Y = GL-50-ER-1 = GL-76
             { type: 'enemy', x: 880, y: GROUND_LEVEL - 76 }
        ],
        blocks: [
            // Fake Pendulum: Stone ball (rect block) on long glass rod pivoting on hinge hack
            // Pivot point (invisible joint) at (650, GL-240)
            // Rope length 140px. Ball radius 30. Mass 30.
            // Stone "ball" block (60x60 rectangle, mass 30)
            // Ball center approx (650, GL-240 + 140) = (650, GL-100)
            { type: 'stone', x: 650, y: GROUND_LEVEL - 100, width: 60, height: 60, mass: 30 },
            // Long glass "rod" connecting pivot to ball (10 wide)
            // Length = 140 - 30 (ball radius) = 110? Or just 140? Use 140.
            // Rod connects (650, GL-240) to (650, GL-100). Center = (650, GL-170).
            { type: 'glass', x: 650, y: GROUND_LEVEL - 170, width: 10, height: 140, mass: 1 }, // Low mass rod
            // Hinge hack: small, low-mass static block at pivot point? Or just let rod swing freely near it.
            // Add a small static block to visually anchor it.
            { type: 'stone', x: 650, y: GROUND_LEVEL - 240, width: 10, height: 10, isStatic: true, mass: 1 },

            // Enemy Structure: Glass/wood mixed house at x=880 (< 200px tall)
            // Let's make a simple 2-story house. Base: 100x20 stone. Walls: 2x (20x60 wood). Roof: 100x20 glass. Total H=100.
            // Base Y = GL - 10. Walls Y = GL-20-30=GL-50. Roof Y = GL-80-10=GL-90.
            { type: 'stone', x: 880, y: GROUND_LEVEL - 10, width: 100, height: 20 }, // Base
            { type: 'wood', x: 880 - 40, y: GROUND_LEVEL - 50, width: 20, height: 60 }, // Left Wall
            { type: 'wood', x: 880 + 40, y: GROUND_LEVEL - 50, width: 20, height: 60 }, // Right Wall
            { type: 'glass', x: 880, y: GROUND_LEVEL - 90, width: 100, height: 20 }, // Roof

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 22000, 2: 44000, 3: 66000 },
        notes: "Pendulum faked with blocks. Joint physics not implemented."
    },

     /* ---------- LEVEL 19: “Glass Labyrinth” ---------- */
    {
        level: 19,
        birds: ['red', 'red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // Enemy in center pocket (860, GL-120 - ER - 1) = (860, GL - 146)
            { type: 'enemy', x: 860, y: GROUND_LEVEL - 146 },
        ],
        blocks: [
            // 7x3 grid of glass blocks (40x20) forming staggered staircase
            // Needs careful placement. Let base layer center Y be GL-10.
            // Layer 0 (Base): 7 blocks, x centers = 860 +/- 0, 40, 80, 120? Spacing 40.
            // x = 860 - 120, 860 - 80, 860 - 40, 860, 860 + 40, 860 + 80, 860 + 120
            // x = 740, 780, 820, 860, 900, 940, 980. Y = GL - 10
            ...Array.from({ length: 7 }, (_, i) => ({
                type: 'glass', x: 740 + i * 40, y: GROUND_LEVEL - 10, width: 40, height: 20
            })),
            // Layer 1: Staggered. Blocks above gaps of Layer 0. x = 760, 800, 840, 880, 920, 960. Y = GL - 10 - 20 = GL - 30
             ...Array.from({ length: 6 }, (_, i) => ({
                type: 'glass', x: 760 + i * 40, y: GROUND_LEVEL - 30, width: 40, height: 20
            })),
             // Layer 2: Staggered. Blocks above gaps of Layer 1. x = 780, 820, 860, 900, 940. Y = GL - 30 - 20 = GL - 50
            ...Array.from({ length: 5 }, (_, i) => ({
                type: 'glass', x: 780 + i * 40, y: GROUND_LEVEL - 50, width: 40, height: 20
            })),
            // Enemy pocket needs modification. Remove block at (860, GL-50)?
            // Let's rebuild slightly differently. Grid around enemy pocket.
            // Pocket at (860, GL-120 - ER - 1). Enemy Y = GL-146. Bottom of enemy = GL-171.
            // Pocket floor Y = GL - 171? Let's set enemy Y = GL-130 center. Bottom GL-155.
            // Build structure around (860, GL-130)
            // Floor block Y = GL-110 (center).
            // Side walls Y = GL-130 (center).
            // Let's retry the staircase to surround the enemy position.
            // Enemy at (860, GL-146). Center Y = GL - 146.
            // Blocks are 40x20.
            // Level 0 (bottom): y=GL-10. 7 blocks x=740..980
            ...Array.from({ length: 7 }, (_, i) => ({ type: 'glass', x: 740 + i * 40, y: GROUND_LEVEL - 10, width: 40, height: 20 })),
            // Level 1: y=GL-30. 6 blocks x=760..960
            ...Array.from({ length: 6 }, (_, i) => ({ type: 'glass', x: 760 + i * 40, y: GROUND_LEVEL - 30, width: 40, height: 20 })),
            // Level 2: y=GL-50. 5 blocks x=780..940
            ...Array.from({ length: 5 }, (_, i) => ({ type: 'glass', x: 780 + i * 40, y: GROUND_LEVEL - 50, width: 40, height: 20 })),
            // Level 3: y=GL-70. 4 blocks x=800..920
            ...Array.from({ length: 4 }, (_, i) => ({ type: 'glass', x: 800 + i * 40, y: GROUND_LEVEL - 70, width: 40, height: 20 })),
            // Level 4: y=GL-90. 3 blocks x=820..900
            ...Array.from({ length: 3 }, (_, i) => ({ type: 'glass', x: 820 + i * 40, y: GROUND_LEVEL - 90, width: 40, height: 20 })),
            // Level 5: y=GL-110. 2 blocks x=840, 880 (leaves gap at 860 for pocket below)
            { type: 'glass', x: 840, y: GROUND_LEVEL - 110, width: 40, height: 20 },
            { type: 'glass', x: 880, y: GROUND_LEVEL - 110, width: 40, height: 20 },
             // Level 6: y=GL-130. 1 block x=860 (roof over pocket)
            { type: 'glass', x: 860, y: GROUND_LEVEL - 130, width: 40, height: 20 },
            // This puts enemy at GL-146 roughly inside pocket below block 860,GL-130.

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 25000, 2: 50000, 3: 75000 }
    },

    /* ---------- LEVEL 20: “Stone Spiral” ---------- */
    {
        level: 20,
        birds: ['red', 'red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // Perched on layer 4 outer tip.
            // Layer 4: y=GL-80 - 4*20 = GL-160. Angle=80deg. Tip position needs calc.
            // Approx enemy pos: x=860+60, y=GL-160-ER-1? Let's place at (920, GL-186)
             { type: 'enemy', x: 920, y: GROUND_LEVEL - 186 }
        ],
        blocks: [
             // Helix-looking tower: 5 layers of 120x20 stone planks.
             // High mass (20), isStatic: false.
             // Center point (860, GL-80). Rotation 20 deg per layer.
             // Layer 0: y=GL-80, angle=0
             // Layer 1: y=GL-100, angle=20
             // Layer 2: y=GL-120, angle=40
             // Layer 3: y=GL-140, angle=60
             // Layer 4: y=GL-160, angle=80
             ...Array.from({ length: 5 }, (_, i) => ({
                type: 'stone',
                x: 860, // Centered horizontally
                y: GROUND_LEVEL - 80 - (i * 20), // Stacked vertically
                width: 120,
                height: 20,
                mass: 20, // Use default stone mass if not customizable per instance
                angle: i * 20 * (Math.PI / 180), // Angle in radians
                isStatic: false
            })),

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 28000, 2: 56000, 3: 84000 }
    },

    /* ---------- LEVEL 21: “Royal Vault” ---------- */
    {
        level: 21,
        birds: ['red', 'red', 'red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // 3 enemies inside behind wooden doors. Vault center x=860?
            // Vault inner size 320x180. Outer 360x220? Walls 20 thick.
            // Inner bottom Y = GL - 180? Inner floor Y=GL-190 center?
            // Place enemies on floor: y = GL-190-10-ER-1 = GL-226
            { type: 'enemy', x: 860 - 50, y: GROUND_LEVEL - 200 - ENEMY_RADIUS - 1 }, // Place relative to vault center. Vault floor Y = GL-200?
            { type: 'enemy', x: 860, y: GROUND_LEVEL - 200 - ENEMY_RADIUS - 1 },
            { type: 'enemy', x: 860 + 50, y: GROUND_LEVEL - 200 - ENEMY_RADIUS - 1 },
        ],
        blocks: [
            // Large rectangular stone bunker. Inner 320x180. Walls 20 thick. Center x=860?
            // Outer dimensions: Width = 320 + 2*20 = 360. Height = 180 + 2*20 = 220.
            // Base position: Bottom Y = GL. Center Y = GL - 110.
            // Assume vault base rests on ground. Bottom Y = GL. Top Y = GL - 220. Center Y = GL - 110.
            // Floor: x=860, y=GL-10, w=360, h=20, stone
            { type: 'stone', x: 860, y: GROUND_LEVEL - 10, width: 360, height: 20 },
            // Left Wall: x=860-180+10=690, y=GL-10-110=GL-120, w=20, h=200 (from floor to ceiling bottom)
            { type: 'stone', x: 860 - 170, y: GROUND_LEVEL - 10 - 100, width: 20, height: 200 },
            // Right Wall: x=860+180-10=1030, y=GL-120, w=20, h=200
            { type: 'stone', x: 860 + 170, y: GROUND_LEVEL - 10 - 100, width: 20, height: 200 },
            // Ceiling (Glass): x=860, y=GL-10-200-10=GL-220, w=360, h=20
            { type: 'glass', x: 860, y: GROUND_LEVEL - 10 - 200 - 10, width: 360, height: 20 },
            // Two vertical wooden doors (20x120) at center. Center x=860.
            // Door Y: Centered vertically? Base on floor? Y = GL-10-60=GL-70.
            // Door 1: x=860-10, y=GL-70, w=20, h=120
            { type: 'wood', x: 860 - 10, y: GROUND_LEVEL - 10 - 60, width: 20, height: 120 },
            // Door 2: x=860+10, y=GL-70, w=20, h=120
            { type: 'wood', x: 860 + 10, y: GROUND_LEVEL - 10 - 60, width: 20, height: 120 },
             // Enemy Y pos check: Floor top = GL-20. Vault inner height 180. Ceiling bottom = GL-200.
             // Place enemies at y=GL-30-ER-1=GL-56.
            // Let's re-adjust enemy Y pos to be on the floor { type: 'enemy', x: 860, y: GROUND_LEVEL - 20 - ENEMY_RADIUS - 1 },

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 32000, 2: 64000, 3: 96000 },
        notes: "Requires TNT block implementation if roof break-in involves explosion." // Added note about TNT dependency
    },

    /* ---------- LEVEL 22: “Domino Doomsday” ---------- */
    {
        level: 22,
        birds: ['red', 'red', 'red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // Sits on pedestal after last domino. Last domino x=400+19*60 = 1540. Pedestal x=1600?
            // Pedestal Y = GL-50 center. Enemy Y = GL-50-20-ER-1 = GL-96.
            { type: 'enemy', x: 1600, y: GROUND_LEVEL - 50 - (40/2) - ENEMY_RADIUS - 1 } // Pedestal is 40x40 glass? Y = GL-50-20-25-1 = GL-96
        ],
        blocks: [
            // 20 tall stone dominoes (20x80) starting x=400, step 60.
            ...Array.from({ length: 20 }, (_, i) => ({
                type: 'stone',
                x: 400 + i * 60,
                y: GROUND_LEVEL - (80/2), // Center Y
                width: 20,
                height: 80
            })),
            // Two TNT among dominoes (positions 8 and 16 - means index 7 and 15)
            // TNT needs implementation. Size 40x40? Placed on top of dominoes?
            // Domino 8 (idx 7) x=400+7*60 = 820. Top Y = GL-80. TNT Y = GL-80-20 = GL-100.
            // Domino 16 (idx 15) x=400+15*60 = 1300. Top Y = GL-80. TNT Y = GL-100.
            { type: 'tnt', x: 820, y: GROUND_LEVEL - 80 - (40/2), width: 40, height: 40 }, // On domino 8 (idx 7)
            { type: 'tnt', x: 1300, y: GROUND_LEVEL - 80 - (40/2), width: 40, height: 40 }, // On domino 16 (idx 15)

            // Enemy pedestal (glass 40x40?) at x=1600
            { type: 'glass', x: 1600, y: GROUND_LEVEL - (40/2), width: 40, height: 40 },

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 35000, 2: 70000, 3: 105000 },
        notes: "Requires TNT block implementation for explosions."
    },

    /* ---------- LEVEL 23: “Tower of Babel” ---------- */
    {
        level: 23,
        birds: ['red', 'red', 'red', 'red', 'red', 'red', 'red'],
        slingshotPos: { x: 150, y: GROUND_LEVEL - 100 },
        enemies: [
            // At floors 3, 6, 9 (top). Assuming floor indices 0-8. Enemy on floor idx 2, 5, 8.
            // Floor height = 60 (pillar) + 20 (plank) = 80.
            // Floor 2 top Y = GL - 2*80 = GL - 160. Enemy Y = GL-160-ER-1 = GL-186
            // Floor 5 top Y = GL - 5*80 = GL - 400. Enemy Y = GL-400-ER-1 = GL-426
            // Floor 8 top Y = GL - 8*80 = GL - 640. Enemy Y = GL-640-ER-1 = GL-666
            { type: 'enemy', x: 860, y: GROUND_LEVEL - 160 - ENEMY_RADIUS - 1 }, // Floor 3 (idx 2)
            { type: 'enemy', x: 860, y: GROUND_LEVEL - 400 - ENEMY_RADIUS - 1 }, // Floor 6 (idx 5)
            { type: 'enemy', x: 860, y: GROUND_LEVEL - 640 - ENEMY_RADIUS - 1 }, // Floor 9 (idx 8)
        ],
        blocks: [
            // 9-storey alternating material tower. Center x=860?
            // Each storey: frame = wood/stone (120x20 plank) + 2 glass pillars (20x60). Height = 80.
            // Total height 9*80=720? Desc says 540 (top at GL-560). Maybe pillar height is 40? 40+20=60 per floor. 9*60=540. Use H=60 per floor.
            // Floor 0: Plank Y=GL-10. Pillars Y=GL-20-20=GL-40.
            // Floor 1: Plank Y=GL-10-60=GL-70. Pillars Y=GL-70-10-20=GL-100.
            // Floor i: Plank Y=GL-10-i*60. Pillars Y=GL-40-i*60.
            ...Array.from({ length: 9 }).flatMap((_, i) => {
                const floorY = GROUND_LEVEL - 10 - (i * 60);
                const pillarY = GROUND_LEVEL - 40 - (i * 60);
                const plankType = (i % 3 === 0) ? 'stone' : 'wood'; // Every third floor (0, 3, 6) is stone

                return [
                    // Plank (Wood or Stone)
                    { type: plankType, x: 860, y: floorY, width: 120, height: 20 },
                    // Left Glass Pillar
                    { type: 'glass', x: 860 - 50, y: pillarY, width: 20, height: 40 }, // Adjusted pillar height
                    // Right Glass Pillar
                    { type: 'glass', x: 860 + 50, y: pillarY, width: 20, height: 40 }, // Adjusted pillar height
                ];
            }),
            // Hidden TNT in floor 5 core (index 4). Plank Y = GL-10-4*60 = GL-250.
            // Needs TNT implementation. Size 40x40?
            { type: 'tnt', x: 860, y: GROUND_LEVEL - 250, width: 40, height: 40 }, // Place centered on floor 5 plank

            // Ground block
            { type: 'stone', x: 0, y: GROUND_LEVEL, width: 1280, height: 50, isStatic: true },
        ],
        starThresholds: { 1: 50000, 2: 100000, 3: 150000 },
        notes: "Requires TNT block implementation. Tower height adjusted based on description."
    },

]; // End of LEVELS array 