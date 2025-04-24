/**
 * @fileoverview Defines game entities like Birds, Enemies, Blocks, and the Slingshot.
 */

import { Vec2, FRICTION } from './physics.js';
import { loadAssets } from './main.js'; // We need access to loaded assets

// --- Constants ---
export const LAUNCH_POWER = 21; // Centralized launch power (Tunable)

// --- Base Entity Class ---

class Entity {
    constructor(x, y, options = {}) {
        this.position = new Vec2(x, y);
        this.velocity = Vec2.zero();
        this.isStatic = options.isStatic ?? false;
        this.mass = options.mass ?? 1;
        this.restitution = options.restitution ?? 0.4;
        this.collisionShape = options.collisionShape ?? { type: 'none' }; // e.g., { type: 'circle', radius: 20 } or { type: 'aabb', width: 40, height: 40 }
        this.isSleeping = false;
        this.sleepTimer = 0;
        this.canSleep = options.canSleep ?? true;
        this.id = options.id || Math.random().toString(36).substring(2, 9); // Unique ID
        this.markedForRemoval = false; // Flag for removal from physics world/render list
        this.hp = options.hp ?? 100; // Health points
        this.maxHp = this.hp;
        this.damageThreshold = options.damageThreshold ?? 500; // Min impulse to cause damage
        this.canCollideStatic = options.canCollideStatic ?? false; // Can static objects collide?
    }

    /** Placeholder for physics update */
    update(dt) { /* Managed by PhysicsWorld */ }

    /** Placeholder for drawing */
    draw(ctx, assets) { /* Implemented by subclasses */ }

    /**
     * Handles collision response.
     * @param {Entity} other The entity collided with.
     * @param {number} impulseMagnitude Magnitude of the collision impulse.
     */
    onCollision(other, impulseMagnitude) {
        this.wake(); // Wake up on any collision

        // Basic damage model
        if (impulseMagnitude > this.damageThreshold) {
            const damage = impulseMagnitude * 0.05; // Scale impulse to damage
            this.takeDamage(damage);
        }
    }

    takeDamage(amount) {
        if (this.isStatic) return; // Static objects don't take damage this way
        this.hp -= amount;
        if (this.hp <= 0) {
            this.destroy();
        }
    }

    /** Marks entity for removal and potentially triggers effects */
    destroy() {
        this.markedForRemoval = true;
        // TODO: Add particle effects or sounds here or in game manager
        console.log(`${this.constructor.name} ${this.id} destroyed.`);
    }

    wake() {
        this.isSleeping = false;
        this.sleepTimer = 0;
    }

    // Helper to get center position (assuming position is center for circles, top-left for AABB initially)
    get center() {
        if (this.collisionShape.type === 'circle') {
            return this.position;
        } else if (this.collisionShape.type === 'aabb') {
            return new Vec2(
                this.position.x + this.collisionShape.width / 2,
                this.position.y + this.collisionShape.height / 2
            );
        }
        return this.position;
    }
}

// --- Bird Class ---

const BIRD_RADIUS = 20;
const BIRD_MASS = 5;

class Bird extends Entity {
    constructor(x, y) {
        super(x, y, {
            mass: BIRD_MASS,
            collisionShape: { type: 'circle', radius: BIRD_RADIUS },
            hp: 50, // Birds are relatively fragile
            damageThreshold: 100,
            canSleep: true,
        });
        this.state = 'idle'; // 'idle', 'aiming', 'flying', 'landed'
        this.lifespan = 5; // Seconds before disappearing after landing
        this.landedTimer = 0;
    }

    update(dt) {
        super.update(dt);
        if (this.state === 'landed') {
            this.landedTimer += dt;
            if (this.landedTimer > this.lifespan) {
                this.destroy();
            }
        }

        // Destroy if out of bounds (adjust bounds as needed)
        if (this.position.y > 800 || this.position.x < -100 || this.position.x > 1400) {
            this.destroy();
        }

        // Transition to landed state if moving slowly after flying
        if (this.state === 'flying' && this.velocity.lenSq() < 100 && !this.isSleeping) {
             // Wait until it's fully stopped (isSleeping might be better)
             if (this.isSleeping) {
                 this.state = 'landed';
                 this.canSleep = false; // Don't sleep again
             }
        }
    }

    draw(ctx, assets) {
        const asset = assets.redbird;
        if (!asset || !asset.complete) {
            // Draw fallback circle if asset not loaded
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.collisionShape.radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        const radius = this.collisionShape.radius;
        // Simple rotation based on velocity direction when flying
        let angle = 0;
        if (this.state === 'flying' && this.velocity.lenSq() > 1) {
            angle = Math.atan2(this.velocity.y, this.velocity.x);
        }

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        ctx.drawImage(asset, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();
    }

    launch(forceVector) {
        if (this.state === 'aiming') {
            // Compensate for immediate friction applied in the first physics step
            const FIRST_STEP_BOOST = 1 / FRICTION;
            this.velocity = forceVector.mul(LAUNCH_POWER * FIRST_STEP_BOOST);
            this.state = 'flying';
            this.wake(); // Ensure it's not sleeping when launched
            // TODO: Play launch sound
        }
    }

     onCollision(other, impulseMagnitude) {
        super.onCollision(other, impulseMagnitude); // Call base collision logic (damage, wake)

        // Bird specific collision logic (e.g., dissipate after hitting something hard)
        if (this.state === 'flying' && impulseMagnitude > 800) { // Threshold for dissipation
             // Maybe add a small delay or check velocity reduction instead
             // this.destroy(); // Or mark for removal after a short effect
        }
    }

    destroy() {
        super.destroy();
        // TODO: Add particle effect (feathers?)
    }
}

// --- Enemy Class ---

const ENEMY_RADIUS = 25;
const ENEMY_MASS = 6;

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, {
            mass: ENEMY_MASS,
            collisionShape: { type: 'circle', radius: ENEMY_RADIUS },
            hp: 150,
            damageThreshold: 300,
            canSleep: true,
        });
        this.scoreValue = 5000;
    }

    update(dt) {
        super.update(dt); // Call base class update if needed (currently empty)

        // Destroy if out of bounds (adjust bounds as needed)
        // Use slightly larger bounds than bird to ensure they are gone
        if (this.position.y > 900 || this.position.x < -200 || this.position.x > 1500) {
            this.destroy();
        }
        // Note: No need to check for sleeping state transition like the bird does,
        // unless we want enemies to also disappear after landing for a while.
    }

    draw(ctx, assets) {
        const asset = assets.greenbird; // Using greenbird sprite as enemy
        if (!asset || !asset.complete) {
             // Draw fallback circle
            ctx.fillStyle = '#4CAF50'; // Green
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.collisionShape.radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        const radius = this.collisionShape.radius;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
         // Simple blink/damage effect
        if (this.hp < this.maxHp * 0.5) {
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 100) * 0.3;
        }
        ctx.drawImage(asset, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();
    }

    onCollision(other, impulseMagnitude) {
         super.onCollision(other, impulseMagnitude);
         // Add enemy specific sounds or effects here
    }

     destroy() {
        super.destroy();
        // TODO: Add particle effect (poof?), play 'oink' sound
        // The game manager should handle score increases
    }
}

// --- Block Class ---

const BLOCK_HP = { wood: 100, stone: 300, glass: 50 };
const BLOCK_MASS = { wood: 8, stone: 20, glass: 5 };
const BLOCK_COLOR = { wood: '#8B4513', stone: '#808080', glass: '#ADD8E6' }; // SaddleBrown, Gray, LightBlue
const BLOCK_RESTITUTION = { wood: 0.3, stone: 0.2, glass: 0.5 };
const BLOCK_DAMAGE_THRESHOLD = { wood: 200, stone: 600, glass: 100 };

class Block extends Entity {
    constructor(x, y, width, height, type = 'wood', isStatic = false) {
        super(x + width / 2, y + height / 2, { // Position is center
            mass: isStatic ? 0 : BLOCK_MASS[type],
            isStatic: isStatic,
            collisionShape: { type: 'aabb', width, height },
            hp: BLOCK_HP[type],
            restitution: BLOCK_RESTITUTION[type],
            damageThreshold: BLOCK_DAMAGE_THRESHOLD[type],
            canSleep: !isStatic,
        });
        this.type = type;
        this.width = width;
        this.height = height;
        this.scoreValue = 500;
    }

    draw(ctx) {
        const x = this.position.x - this.width / 2;
        const y = this.position.y - this.height / 2;

        ctx.fillStyle = BLOCK_COLOR[this.type];
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(x, y, this.width, this.height);
        ctx.fill();
        ctx.stroke();

        // Draw health bar or cracks based on HP
        if (this.hp < this.maxHp) {
            const crackOpacity = 1 - (this.hp / this.maxHp);
            ctx.strokeStyle = `rgba(0, 0, 0, ${crackOpacity * 0.8})`;
            ctx.lineWidth = 1 + crackOpacity * 3;
            ctx.beginPath();
            // Simple crack pattern (could be more complex)
            ctx.moveTo(x + this.width * 0.2, y + this.height * 0.2);
            ctx.lineTo(x + this.width * 0.8, y + this.height * 0.8);
            ctx.moveTo(x + this.width * 0.8, y + this.height * 0.2);
            ctx.lineTo(x + this.width * 0.2, y + this.height * 0.8);
             if (this.hp < this.maxHp * 0.5) {
                ctx.moveTo(x + this.width * 0.5, y + this.height * 0.1);
                ctx.lineTo(x + this.width * 0.5, y + this.height * 0.9);
            }
            ctx.stroke();
        }
    }

     destroy() {
        super.destroy();
        // TODO: Add particle effect (wood splinters, glass shards, stone dust)
        // The game manager should handle score increases
    }
}

// --- Slingshot Class ---

class Slingshot {
    constructor(x, y) {
        this.position = new Vec2(x, y);
        this.anchorOffsetBack = new Vec2(-10, 5); // Relative to base
        this.anchorOffsetFront = new Vec2(10, 5);  // Relative to base
        this.elasticLength = 80; // Max drag distance
        this.elasticity = 0.1; // Stiffness (lower = stiffer)
        this.aimingBird = null;
        this.dragStartPos = null;
        this.dragCurrentPos = null;
    }

    get anchorBackPos() { return this.position.add(this.anchorOffsetBack); }
    get anchorFrontPos() { return this.position.add(this.anchorOffsetFront); }

    /** Return the exact point the bird leaves the band */
    getLaunchOrigin() {
        // Matches the offset applied in attachBird
        return this.anchorFrontPos.add(new Vec2(0, -BIRD_RADIUS));
    }

    /** Binds a bird to the slingshot for aiming */
    attachBird(bird) {
        if (!this.aimingBird) {
            this.aimingBird = bird;
            this.aimingBird.state = 'aiming';
            this.aimingBird.position = this.anchorFrontPos.add(new Vec2(0, -BIRD_RADIUS)); // Initial bird pos
             this.aimingBird.velocity = Vec2.zero(); // Stop any previous motion
             this.aimingBird.wake();
        }
    }

    startAim(pointerPos) {
        if (this.aimingBird) {
            const birdPos = this.aimingBird.position;
            const distSq = pointerPos.sub(birdPos).lenSq();
            // Check if click is near the bird
            if (distSq < (this.aimingBird.collisionShape.radius * 1.5) ** 2) {
                 this.dragStartPos = pointerPos;
                 this.dragCurrentPos = pointerPos;
                 return true; // Aiming started
            }
        }
        return false; // Click was not on the bird
    }

    updateAim(pointerPos) {
        if (this.aimingBird && this.dragStartPos) {
            this.dragCurrentPos = pointerPos;

            const dragVector = this.dragCurrentPos.sub(this.dragStartPos);
            // Calculate target position based on slingshot anchor and drag
            let targetPos = this.anchorFrontPos.add(new Vec2(0, -BIRD_RADIUS)).add(dragVector);

            // Clamp distance to elasticLength
            const fromAnchor = targetPos.sub(this.anchorFrontPos);
            const dist = fromAnchor.len();
            if (dist > this.elasticLength) {
                targetPos = this.anchorFrontPos.add(fromAnchor.normalize().mul(this.elasticLength));
            }

            this.aimingBird.position = targetPos;
        }
    }

    /**
     * Calculates the launch velocity based on the current aiming position.
     * @returns {Vec2} The calculated launch velocity vector.
     */
    getLaunchVelocity() {
        if (!this.aimingBird || !this.dragStartPos) {
            return Vec2.zero();
        }
        // Calculate vector from front anchor to bird's current pulled position
        const launchVector = this.anchorFrontPos.sub(this.aimingBird.position);
        // Return the raw, unscaled vector
        return launchVector;
    }

    endAim() {
        if (this.aimingBird && this.dragStartPos) {
            const launchVelocity = this.getLaunchVelocity();
            if (launchVelocity.lenSq() > 0) { // Only launch if there's velocity
                this.aimingBird.launch(launchVelocity); // Launch the bird using the calculated velocity
                this.aimingBird = null; // Release bird from slingshot
                this.dragStartPos = null;
                this.dragCurrentPos = null;
                // TODO: Play twang sound
                return true; // Launch occurred
            }
        }
         // Reset aiming state even if launch didn't happen (e.g., no pull)
        this.aimingBird = null;
        this.dragStartPos = null;
        this.dragCurrentPos = null;
        return false; // No launch
    }

    draw(ctx) {
        // Draw the slingshot structure (simple lines for now)
        ctx.strokeStyle = '#3b200a'; // Dark brown
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        // Base Y structure
        ctx.beginPath();
        ctx.moveTo(this.position.x - 15, this.position.y + 40);
        ctx.lineTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + 15, this.position.y + 40);
        ctx.stroke();

        // Draw elastic bands
        ctx.strokeStyle = '#d2691e'; // Chocolate color
        ctx.lineWidth = 5;

        const backAnchor = this.anchorBackPos;
        const frontAnchor = this.anchorFrontPos;
        const birdPos = this.aimingBird ? this.aimingBird.position : frontAnchor.add(new Vec2(0, -BIRD_RADIUS));

        // Back band
        ctx.beginPath();
        ctx.moveTo(backAnchor.x, backAnchor.y);
        ctx.lineTo(birdPos.x, birdPos.y);
        ctx.stroke();

        // Front band
        ctx.beginPath();
        ctx.moveTo(frontAnchor.x, frontAnchor.y);
        ctx.lineTo(birdPos.x, birdPos.y);
        ctx.stroke();
    }
}

export { Entity, Bird, Enemy, Block, Slingshot }; 