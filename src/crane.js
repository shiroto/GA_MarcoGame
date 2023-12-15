export class Crane {
    constructor(parent, position, range, sprite, fruitFactory) {
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
    }

    set position(value) {
        if (value.x > this.range[0] && value.x < this.range[1]) {
            this.sprite.x = value.x;
        }
    }

    _onMouseMove(point) {
        this.position = point;
    }

    _handleClick(event) {
        this.fruitFactory.spawnFruit(vec2.fromValues(event.x, this.sprite.y), 0);
    }
}