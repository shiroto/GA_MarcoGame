export class Entity extends PIXI.utils.EventEmitter {
    constructor(ticker, parent, position, sprite, mass) {
        super();
        console.log(`Creating ${this.constructor.name}`);
        this.isDestroyed = false;
        this.ticker = ticker;
        this.updateEvent = this._update.bind(this);
        this.ticker.add(this.updateEvent);
        this.parent = parent;
        this.sprite = sprite;
        this.parent.addChild(this.sprite);
        this.radius = sprite.width / 2;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.entityPosition = position;
        this.mass = mass;
    }

    get position() {
        if (this.physicsBody == null) {
            return this.entityPosition;
        } else {
            return this.physicsBody.position;
        }
    }
    get positionVec2() { return vec2.fromValues(this.physicsBody.position.x, this.physicsBody.position.y); }
    set position(value) {
        if (this.physicsBody == null) {
            this.entityPosition = value;
        } else {
            this.physicsBody.position = value;
        }
    }
    set target(value) { this.targetEntity = value; }

    createBody() {
        this.physicsBody = Matter.Bodies.circle(this.entityPosition.x, this.entityPosition.y, this.radius, { mass: this.mass });
        this.physicsBody.entity = this;
    }

    destroy() {
        this.isDestroyed = true;
        console.log(`Destroying ${this.constructor.name}`);
        this.ticker.remove(this.updateEvent);
        this.parent.removeChild(this.sprite);
        this.sprite.destroy();
        this.emit('onDestroyed', this);
    }

    _update(delta) {
        if (this.targetEntity != null) {
            const dir = vec2.sub(vec2.create(), this.targetEntity.positionVec2, this.positionVec2);
            vec2.normalize(dir, dir);
            vec2.scale(dir, dir, delta);
            this.position = { x: this.positionVec2[0] + dir[0], y: this.positionVec2[1] + dir[1] };
        }
        this._updateSprite();
    }

    _updateSprite() {
        if (this.physicsBody == null) {
            this.sprite.x = this.entityPosition.x;
            this.sprite.y = this.entityPosition.y;
        } else {
            this.sprite.rotation = this.physicsBody.angle;
            this.sprite.x = this.physicsBody.position.x;
            this.sprite.y = this.physicsBody.position.y;
        }
    }
}