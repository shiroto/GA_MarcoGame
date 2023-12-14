export class CollisionSystem {
    constructor(ticker) {
        ticker.add((delta) => this._update(delta));
        this.layerEntities = [];
        this.layerEntities[0] = [];
        this.collisionsLastFrame = new Set();
    }

    setBucket(sprite) {
        this.bucket = sprite;
        this.bucketBottomLeft = vec2.fromValues(sprite.x, sprite.y + sprite.height);
        this.bucketBottomRight = vec2.fromValues(sprite.x + sprite.width, sprite.y + sprite.height);
        this.bucketBottomNormal = vec2.fromValues(0, -1);
        this.bucketLeftNormal = vec2.fromValues(1, 0);
        this.bucketRightNormal = vec2.fromValues(-1, 0);
    }

    registerToFruitLayer(entity) {
        this._registerToLayer(entity, 0);
    }

    _update(delta) {
        const collisionsThisFrame = new Set([], this._collisionComparison);

        // bucket x fruit collisions
        this.layerEntities[0].forEach(e => {
            const p = e.getPosition();
            if (p[1] + e.radius >= this.bucketBottomLeft[1]) {
                const reflection = reflect(e.velocity, this.bucketBottomNormal);
                collisionsThisFrame.add({ e1: e, e2: this.bucketBottomNormal, reflection, bucket: true, ground: true, distance: p[1] + e.radius - this.bucketBottomLeft[1] });
            }
            if (p[0] - e.radius <= this.bucketBottomLeft[0]) {
                const reflection = reflect(e.velocity, this.bucketLeftNormal);
                collisionsThisFrame.add({ e1: e, e2: this.bucketLeftNormal, reflection, bucket: true, ground: false, distance: this.bucketBottomLeft[0] - (p[0] - e.radius) });
            }
            if (p[0] + e.radius >= this.bucketBottomRight[0]) {
                const reflection = reflect(e.velocity, this.bucketRightNormal);
                collisionsThisFrame.add({ e1: e, e2: this.bucketRightNormal, reflection, bucket: true, ground: false, distance: p[0] + e.radius - this.bucketBottomRight[0] });
            }
        });

        // fruit x fruit collisions
        const len = this.layerEntities[0].length;
        for (let i = 0; i < len; i++) {
            const e1 = this.layerEntities[0][i];
            const p1 = e1.getPosition();
            for (let j = i + 1; j < len; j++) {
                const e2 = this.layerEntities[0][j];
                const p2 = e2.getPosition();
                const dist = vec2.dist(p1, p2);
                if (dist <= e1.radius + e2.radius) {
                    collisionsThisFrame.add({ e1, e2, bucket: false, ground: false });
                }
            }
        }

        const stayedCollisions = this._setIntersection(collisionsThisFrame, this.collisionsLastFrame);
        const enteredCollisions = this._setDifference(collisionsThisFrame, stayedCollisions);
        const exitedCollisions = this._setDifference(this.collisionsLastFrame, stayedCollisions);

        // resolve collisions
        enteredCollisions.forEach(cEnter => {
            if (!cEnter.e1.isDestroyed && !cEnter.e2.isDestroyed) {
                if (cEnter.bucket === false) {
                    const velocities = calculateNewVelocities(cEnter.e1, cEnter.e2);
                    cEnter.e1.onCollisionEnter({ e1: cEnter.e1, e2: cEnter.e2, reflection: velocities.vel1, bucket: false, ground: false });
                    cEnter.e2.onCollisionEnter({ e1: cEnter.e2, e2: cEnter.e1, reflection: velocities.vel2, bucket: false, ground: false });
                } else {
                    cEnter.e1.onCollisionEnter(cEnter);
                }
            }
        });
        stayedCollisions.forEach(cStay => {
            if (!cStay.e1.isDestroyed && !cStay.e2.isDestroyed) {
                if (cStay.bucket === false) {
                    const dir = vec2.sub(vec2.create(), cStay.e1.position, cStay.e2.position);
                    const nextPos1 = vec2.add(vec2.create(), cStay.e1.position, vec2.scale(vec2.create(), cStay.e1.velocity, delta));
                    const nextPos2 = vec2.add(vec2.create(), cStay.e2.position, vec2.scale(vec2.create(), cStay.e2.velocity, delta));
                    const nextDir = vec2.sub(vec2.create(), nextPos1, nextPos2);
                    if (vec2.sqrLen(nextDir) < vec2.sqrLen(dir)) { // if they are being pushed together, force them apart
                        vec2.normalize(dir, dir);
                        const force = cStay.e1.radius + cStay.e1.radius - vec2.distance(cStay.e1.position, cStay.e2.position);
                        vec2.scale(dir, dir, force * 0.05);
                        vec2.add(cStay.e1.velocity, cStay.e1.velocity, dir);
                        vec2.sub(cStay.e2.velocity, cStay.e2.velocity, dir);
                    }
                } else {
                    const dot = vec2.dot(cStay.e1.velocity, cStay.e2);
                    if (dot < 0) {
                        let dir = vec2.fromValues(-cStay.e1.velocity[0], -cStay.e1.velocity[1]);
                        vec2.normalize(dir, dir);
                        vec2.scale(dir, dir, cStay.distance);
                        vec2.add(cStay.e1.velocity, cStay.e1.velocity, dir);
                    }
                }
            }
        });
        exitedCollisions.forEach(cExit => {
            cExit.e1.onCollisionExit(cExit);
        });
        this.collisionsLastFrame = collisionsThisFrame;
    }

    _collisionComparison(c1, c2) {
        return c1.e1 == c2.e1 && c1.e2 == c2.e2;
    }

    _setDifference(setA, setB) {
        let difference = new Set(setA);
        setA.forEach(c1 => {
            setB.forEach(c2 => {
                if (this._collisionComparison(c1, c2)) {
                    difference.delete(c1);
                }
            });
        });
        return difference;
    }

    _setIntersection(setA, setB) {
        let intersection = new Set();
        setA.forEach(c1 => {
            setB.forEach(c2 => {
                if (this._collisionComparison(c1, c2)) {
                    intersection.add(c1);
                }
            });
        });
        return intersection;
    }

    _registerToLayer(entity, layer) {
        this.layerEntities[layer].push(entity);
        entity.on('onDestroyed', (entity) => {
            this._removeEntity(entity, layer);
        });
    }

    _removeEntity(entity, layer) {
        const layerArray = this.layerEntities[layer];
        const index = layerArray.indexOf(entity);
        if (index !== -1) {
            layerArray.splice(index, 1);
        }
    }
}

function reflect(incomingVector, normalVector) {
    const dot = vec2.dot(incomingVector, normalVector) * 2;
    let mul = vec2.scale(vec2.create(), normalVector, dot);
    let sub = vec2.sub(vec2.create(), incomingVector, mul);
    return sub;
}

function calculateNewVelocities(e1, e2) {
    let vel1 = vec2.clone(e1.velocity);
    let vel2 = vec2.clone(e2.velocity);
    // Calculate relative velocity along the normal vector
    const relativeVelocity = vec2.subtract(vec2.create(), vel2, vel1);
    const relativePosition = vec2.subtract(vec2.create(), e2.position, e1.position);
    const relativeVelocityNormal = vec2.dot(relativeVelocity, vec2.normalize(vec2.create(), relativePosition));

    // Calculate impulse along the normal vector
    const impulseNormal = (2 * e2.mass) / (e1.mass + e2.mass) * relativeVelocityNormal;

    // Update velocities along the normal vector
    const normalVector = vec2.normalize(vec2.create(), relativePosition);
    vel1 = vec2.add(vel1, vel1, vec2.scale(vec2.create(), normalVector, impulseNormal / e1.mass));
    vel2 = vec2.subtract(vel2, vel2, vec2.scale(vec2.create(), normalVector, impulseNormal / e2.mass));

    // Calculate relative velocity along the tangent vector
    const relativeVelocityTangent = vec2.subtract(vec2.create(), relativeVelocity, vec2.scale(vec2.create(), normalVector, vec2.dot(relativeVelocity, normalVector)));
    vec2.scale(relativeVelocityTangent, relativeVelocityTangent, 0.2); // add friction

    // Update velocities along the tangent vector
    vel1 = vec2.add(vel1, vel1, relativeVelocityTangent);
    vel2 = vec2.add(vel2, vel2, relativeVelocityTangent);

    return { vel1, vel2 };
}