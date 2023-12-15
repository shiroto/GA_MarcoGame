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
        this.physicsBody = Matter.Bodies.circle(position[0], position[1], this.radius, { mass: mass });
        this.physicsBody.entity = this;
    }

    get position() { return this.physicsBody.position; }
    get positionVec2() { return vec2.fromValues(this.physicsBody.position.x, this.physicsBody.position.y); }
    set position(value) { this.physicsBody.position = value; }
    set target(value) { this.targetEntity = value; }

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
        this.sprite.rotation = this.physicsBody.angle;
        this.sprite.x = this.physicsBody.position.x;
        this.sprite.y = this.physicsBody.position.y;
    }
}