/**
 * @fileoverview Basic 2D Physics Engine
 * Handles gravity, collisions (AABB/Circle), and impulse resolution.
 */

const pixelsPerMeter = 100; // Define base unit conversion
const GRAVITY_ACCEL = 9.81;   // Standard gravity in m/s^2
const GRAVITY = GRAVITY_ACCEL * pixelsPerMeter; // Gravity in pixels/s^2
const TIME_STEP = 1 / 60;   // 60 FPS physics step
const FRICTION = 0.98;      // Linear damping factor per step (closer to 1.0 = less drag)
const RESTITUTION = 0.4;    // Bounciness factor for collisions
const MIN_VELOCITY_FOR_SLEEP = 2.0; // Lowered threshold
const SLEEP_DELAY_FRAMES = 60; // Lowered delay (1 second at 60fps)

/** Basic 2D Vector class */
class Vec2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    mul(s) { return new Vec2(this.x * s, this.y * s); }
    div(s) { return s !== 0 ? new Vec2(this.x / s, this.y / s) : new Vec2(); }
    dot(v) { return this.x * v.x + this.y * v.y; }
    lenSq() { return this.dot(this); }
    len() { return Math.sqrt(this.lenSq()); }
    normalize() { const l = this.len(); return l > 0 ? this.div(l) : new Vec2(); }
    perp() { return new Vec2(-this.y, this.x); } // Perpendicular vector
    static zero() { return new Vec2(0, 0); }
}


/**
 * The main physics world simulation.
 */
export class PhysicsWorld {
    constructor() {
        this.entities = [];
        this.collisions = [];
    }

    addEntity(entity) {
        if (entity && !this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    /**
     * Advances the simulation by one time step.
     * @param {number} dt Delta time (usually TIME_STEP)
     */
    update(dt) {
        // 1. Apply forces (like gravity)
        this.applyForces(dt);

        // 2. Integrate velocity and update position
        this.integrate(dt);

        // --- Collision Resolution Sub-steps ---
        // Running detection and resolution multiple times helps stabilize stacks.
        const subSteps = 8; // Increased number of iterations
        for (let i = 0; i < subSteps; i++) {
            this.collisions = this.detectCollisions();
            this.resolveCollisions(dt); // Pass the original dt for impulse calculations, but run the resolution multiple times
        }

        // 5. Handle sleeping/waking (after all resolutions)
        this.updateSleepState(dt);
    }

    applyForces(dt) {
        for (const entity of this.entities) {
            if (entity.isStatic || entity.isSleeping) continue;

            // Apply gravity (if entity has mass)
            if (entity.mass > 0) {
                entity.velocity = entity.velocity.add(new Vec2(0, GRAVITY * dt));
            }
            // Apply linear damping (friction)
            entity.velocity = entity.velocity.mul(FRICTION);
        }
    }

    integrate(dt) {
        for (const entity of this.entities) {
            if (entity.isStatic || entity.isSleeping) continue;
            entity.position = entity.position.add(entity.velocity.mul(dt));

            // NaN Check
            if (isNaN(entity.position.x) || isNaN(entity.position.y) || isNaN(entity.velocity.x) || isNaN(entity.velocity.y)) {
                console.warn(`NaN detected in entity ${entity.constructor.name} (ID: ${entity.id ?? 'N/A'}) after integration!`, 
                             `Pos: (${entity.position.x}, ${entity.position.y}), Vel: (${entity.velocity.x}, ${entity.velocity.y})`);
                // Optional: Reset state to prevent propagation, though logging is key
                // entity.position = new Vec2(canvas.width / 2, canvas.height / 2); // Center screen? Or original position?
                // entity.velocity = Vec2.zero();
                // For now, just log
            }
        }
    }

    detectCollisions() {
        const collisions = [];
        const count = this.entities.length;

        for (let i = 0; i < count; i++) {
            const entityA = this.entities[i];
            if (entityA.isStatic && !entityA.canCollideStatic) continue; // Skip static-static unless specified

            for (let j = i + 1; j < count; j++) {
                const entityB = this.entities[j];

                // Skip static-static or sleeping pairs
                if ((entityA.isStatic && entityB.isStatic) ||
                    (entityA.isSleeping && entityB.isSleeping))
                {
                    continue;
                }

                const collisionInfo = this.checkCollision(entityA, entityB);
                if (collisionInfo) {
                    collisions.push(collisionInfo);
                }
            }
        }
        return collisions;
    }

    /**
     * Checks collision between two entities based on their shape.
     * @param {object} a Entity A
     * @param {object} b Entity B
     * @returns {object|null} Collision info {a, b, normal, penetration} or null
     */
    checkCollision(a, b) {
        const shapeA = a.collisionShape;
        const shapeB = b.collisionShape;

        if (shapeA.type === 'circle' && shapeB.type === 'circle') {
            return this.checkCircleCircle(a, b);
        } else if (shapeA.type === 'aabb' && shapeB.type === 'aabb') {
            return this.checkAABBAABB(a, b);
        } else if (shapeA.type === 'circle' && shapeB.type === 'aabb') {
            return this.checkCircleAABB(a, b);
        } else if (shapeA.type === 'aabb' && shapeB.type === 'circle') {
            const result = this.checkCircleAABB(b, a); // Swap order
            if (result) {
                result.normal = result.normal.mul(-1); // Invert normal
            }
            return result;
        }
        return null;
    }

    checkCircleCircle(a, b) {
        const r = a.collisionShape.radius + b.collisionShape.radius;
        const distVec = b.position.sub(a.position);
        const distSq = distVec.lenSq();

        if (distSq < r * r) {
            const dist = Math.sqrt(distSq);
            const normal = dist > 0 ? distVec.div(dist) : new Vec2(1, 0);
            const penetration = r - dist;
            return { a, b, normal, penetration };
        }
        return null;
    }

    checkAABBAABB(a, b) {
        const posA = a.position;
        const posB = b.position;
        const halfA = { w: a.collisionShape.width / 2, h: a.collisionShape.height / 2 };
        const halfB = { w: b.collisionShape.width / 2, h: b.collisionShape.height / 2 };

        const vec = posB.sub(posA);
        const overlapX = (halfA.w + halfB.w) - Math.abs(vec.x);
        const overlapY = (halfA.h + halfB.h) - Math.abs(vec.y);

        if (overlapX > 0 && overlapY > 0) {
            let normal, penetration;
            if (overlapX < overlapY) {
                penetration = overlapX;
                normal = new Vec2(vec.x < 0 ? -1 : 1, 0);
            } else {
                penetration = overlapY;
                normal = new Vec2(0, vec.y < 0 ? -1 : 1);
            }
            return { a, b, normal, penetration };
        }
        return null;
    }

    checkCircleAABB(circle, aabb) {
        const circlePos = circle.position;
        const aabbPos = aabb.position;
        const halfW = aabb.collisionShape.width / 2;
        const halfH = aabb.collisionShape.height / 2;
        const radius = circle.collisionShape.radius;

        // Vector from AABB center to circle center
        const vec = circlePos.sub(aabbPos);

        // Find closest point on AABB to circle center
        const closestX = Math.max(-halfW, Math.min(vec.x, halfW));
        const closestY = Math.max(-halfH, Math.min(vec.y, halfH));
        const closestPoint = new Vec2(closestX, closestY);

        // Vector from closest point to circle center
        const delta = vec.sub(closestPoint);
        const distSq = delta.lenSq();

        if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            const normal = dist > 0 ? delta.div(dist) : vec.normalize(); // Fallback if circle center inside AABB
            const penetration = radius - dist;
            return { a: circle, b: aabb, normal, penetration };
        }
        return null;
    }


    resolveCollisions(dt) {
        for (const collision of this.collisions) {
            const { a, b, normal, penetration } = collision;

            // Wake up sleeping objects involved in collision
            if (a.isSleeping) a.wake();
            if (b.isSleeping) b.wake();

            const invMassA = a.mass > 0 ? 1 / a.mass : 0;
            const invMassB = b.mass > 0 ? 1 / b.mass : 0;
            const totalInvMass = invMassA + invMassB;

            if (totalInvMass === 0) continue; // Both objects are static

            // Separate overlapping objects (Positional Correction)
            const penetrationSlop = 0.1; // Allow tiny overlaps to prevent jitter
            const correctionPercent = 0.8; // How much of the penetration to correct per step (adjust between 0.2 and 0.8)
            // Ensure correctionMagnitude doesn't become NaN if totalInvMass is somehow zero (though checked above)
            const correctionMagnitude = (Math.max(penetration - penetrationSlop, 0) / (totalInvMass || 1e-9)) * correctionPercent; 
            const correction = normal.mul(correctionMagnitude);

            const oldPosA = a.position; // Store old pos for NaN check
            const oldPosB = b.position;

            if (!a.isStatic) a.position = a.position.sub(correction.mul(invMassA));
            if (!b.isStatic) b.position = b.position.add(correction.mul(invMassB));

            // NaN check after positional correction
            if (isNaN(a.position.x) || isNaN(a.position.y)) {
                 console.warn(`NaN detected in entity A (${a.constructor.name}) after positional correction! Resetting.`,
                             `Old Pos: (${oldPosA.x}, ${oldPosA.y}), Correction: (${correction.x * invMassA}, ${correction.y * invMassA}), Pen: ${penetration}, Normal: (${normal.x}, ${normal.y})`);
                 a.position = oldPosA; // Revert position
            }
             if (isNaN(b.position.x) || isNaN(b.position.y)) {
                 console.warn(`NaN detected in entity B (${b.constructor.name}) after positional correction! Resetting.`,
                             `Old Pos: (${oldPosB.x}, ${oldPosB.y}), Correction: (${correction.x * invMassB}, ${correction.y * invMassB}), Pen: ${penetration}, Normal: (${normal.x}, ${normal.y})`);
                 b.position = oldPosB; // Revert position
            }


            // Calculate relative velocity
            const rv = b.velocity.sub(a.velocity);

            // Calculate relative velocity in terms of the normal direction
            const velAlongNormal = rv.dot(normal);

            // Do not resolve if velocities are separating
            if (velAlongNormal > 0) continue;

            // Calculate restitution (bounciness)
            const e = Math.min(a.restitution ?? RESTITUTION, b.restitution ?? RESTITUTION);

            // Calculate impulse scalar (magnitude)
            // Simplified impulse formula (without tangential friction for now)
            let j = -(1 + e) * velAlongNormal;
            // Ensure j doesn't become NaN/Infinity if totalInvMass is zero (checked earlier, but safety)
            j /= (totalInvMass || 1e-9); 

            // Apply impulse
            const impulseVec = normal.mul(j);

            const oldVelA = a.velocity; // Store old vel for NaN check
            const oldVelB = b.velocity;

            if (!a.isStatic) a.velocity = a.velocity.sub(impulseVec.mul(invMassA));
            if (!b.isStatic) b.velocity = b.velocity.add(impulseVec.mul(invMassB));

            // NaN check after impulse
             if (isNaN(a.velocity.x) || isNaN(a.velocity.y)) {
                 console.warn(`NaN detected in entity A (${a.constructor.name}) velocity after impulse! Resetting.`,
                              `Old Vel: (${oldVelA.x}, ${oldVelA.y}), Impulse: (${impulseVec.x * invMassA}, ${impulseVec.y * invMassA}), j: ${j}, Normal: (${normal.x}, ${normal.y})`);
                 a.velocity = oldVelA; // Revert velocity
            }
             if (isNaN(b.velocity.x) || isNaN(b.velocity.y)) {
                 console.warn(`NaN detected in entity B (${b.constructor.name}) velocity after impulse! Resetting.`,
                              `Old Vel: (${oldVelB.x}, ${oldVelB.y}), Impulse: (${impulseVec.x * invMassB}, ${impulseVec.y * invMassB}), j: ${j}, Normal: (${normal.x}, ${normal.y})`);
                 b.velocity = oldVelB; // Revert velocity
            }

            // Notify entities about the collision
            const impulseMagnitude = impulseVec.len();
            if (a.onCollision) a.onCollision(b, impulseMagnitude);
            if (b.onCollision) b.onCollision(a, impulseMagnitude);
        }
    }

    updateSleepState(dt) {
        for (const entity of this.entities) {
            if (entity.isStatic || !entity.canSleep) continue;

            const speedSq = entity.velocity.lenSq();
            if (speedSq < MIN_VELOCITY_FOR_SLEEP * MIN_VELOCITY_FOR_SLEEP) {
                entity.sleepTimer += dt;
                if (entity.sleepTimer >= SLEEP_DELAY_FRAMES * TIME_STEP) {
                    entity.isSleeping = true;
                    entity.velocity = Vec2.zero();
                }
            } else {
                entity.wake(); // Reset timer if moving significantly
            }
        }
    }
}

// Export Vec2 as well if needed by other modules
// Export constants for use in other modules
export { Vec2, pixelsPerMeter, GRAVITY, TIME_STEP, FRICTION }; 