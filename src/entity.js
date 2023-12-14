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

    destroy() {
        this.isDestroyed = true;
        console.log(`Destroying ${this.constructor.name}`);
        this.ticker.remove(this.updateEvent);
        this.parent.removeChild(this.sprite);
        this.sprite.destroy();
        this.emit('onDestroyed', this);
    }

    _update(delta) {
        this.sprite.rotation = this.physicsBody.angle;
        this.sprite.x = this.physicsBody.position.x;
        this.sprite.y = this.physicsBody.position.y;
    }
}