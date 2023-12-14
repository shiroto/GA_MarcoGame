const GRAVITY = vec2.fromValues(0, 0.2);
const FRICTION = 0.4;

// Base class for all game objects. Has a sprite, position, radius, can be updated, destroyed and react to collisions.
export class Entity extends PIXI.utils.EventEmitter {
    constructor(ticker, parent, position, sprite, mass, mergeCallback) {
        super();
        console.log(`Creating ${this.constructor.name}`);
        this.ticker = ticker;
        this.updateEvent = this._update.bind(this);
        this.ticker.add(this.updateEvent);
        this.parent = parent;
        this.sprite = sprite;
        this.positionOffset = vec2.fromValues(sprite.width / 2, sprite.height / 2); // Center of the sprite.
        this._setPosition(position);
        this.parent.addChild(this.sprite);
        this.radius = sprite.width / 2;
        this.velocity = vec2.fromValues(0, 0);
        this.isGrounded = false;
        this.mass = mass;
        this.mergeCallback = mergeCallback;
        this.isDestroyed = false;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.physicsBody = Matter.Bodies.circle(position[0], position[1], this.radius);        
    }

    get position() { return this.getPosition(); }

    getPosition() {
        const pos = vec2.fromValues(this.sprite.x + this.positionOffset[0], this.sprite.y + this.positionOffset[1]);
        return pos;
    }

    _setPosition(vec2) {
        this.sprite.x = vec2[0] - this.positionOffset[0];
        this.sprite.y = vec2[1] - this.positionOffset[1];
    }

    destroy() {
        this.isDestroyed = true;
        console.log(`Destroying ${this.constructor.name}`);
        this.ticker.remove(this.updateEvent);
        this.parent.removeChild(this.sprite);
        this.sprite.destroy();
        this.emit('onDestroyed', this);
    }

    onCollisionEnter(collision) {
        if (this.isDestroyed === true) {
            return;
        }
        if (collision.e2 instanceof Entity) {
            if (this.mass === collision.e2.mass) {
                this.mergeCallback(collision.e1, collision.e2);
            } else {
                this.velocity = collision.reflection;
            }
        } else {
            vec2.scale(this.velocity, collision.reflection, FRICTION);
            if (collision.ground === true) {
                this.isGrounded = true;
            }
        }
    }

    onCollisionStay(collision) {
        if (this.isDestroyed === true) {
            return;
        }
    }

    onCollisionExit(collision) {
        if (this.isDestroyed === true) {
            return;
        }
        if (collision.ground === true) {
            this.isGrounded = false;
        }
    }

    _update(delta) {
        if (this.isDestroyed === true) {
            return;
        }
        this.sprite.x = this.physicsBody.position.x;
        this.sprite.y = this.physicsBody.position.y;
        // if (!this.isGrounded) {
        //     let frameGravity = vec2.create();
        //     vec2.scale(frameGravity, GRAVITY, delta);
        //     vec2.add(this.velocity, this.velocity, frameGravity);
        // }
        // const newPos = vec2.add(vec2.create(), this.position, this.velocity);
        // this._setPosition(newPos);
    }
}