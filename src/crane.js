export class Crane {
    constructor(engine, parent, position, range, sprite, fruitFactory) {
        this.engine = engine;
        this.parent = parent;
        this.sprite = sprite;
        this.parent.addChild(this.sprite);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.x = position[0];
        this.sprite.y = position[1];
        this.range = range;
        this.fruitFactory = fruitFactory;
        window.addEventListener('click', event => this._handleClick(event));
        window.addEventListener('mousemove', event => this._onMouseMove(event));
        this._createNewFruit();
    }

    set position(value) {
        if (value.x > this.range[0] && value.x < this.range[1]) {
            this.sprite.x = value.x;
            this._setFruitPosition();
        }
    }

    _setFruitPosition() {
        if (this.nextFruit != null) {
            let pos = { x: this.sprite.position.x, y: this.sprite.position.y };
            pos.y += 30;
            this.nextFruit.position = pos;
        }
    }

    _onMouseMove(point) {
        this.position = point;
    }

    _handleClick(event) {
        this.nextFruit.createBody();
        Matter.Composite.add(this.engine.world, [this.nextFruit.physicsBody]);
        this.nextFruit = null;
        window.setTimeout(() => this._createNewFruit(), 500);
    }

    _createNewFruit() {
        this.nextFruit = this.fruitFactory.createFruit(vec2.fromValues(this.sprite.x, this.sprite.y));
        this._setFruitPosition();
    }
}