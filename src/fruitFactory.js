import { Entity } from './entity.js';

export class FruitFactory {
    constructor(app, engine) {
        this.app = app;
        this.engine = engine;
    }

    spawnFruit(point, size) {
        const startPos = vec2.fromValues(point[0], point[1]);
        const sprite = PIXI.Sprite.from(sizes[size]);
        const entity = new Entity(this.app.ticker, this.app.stage, startPos, sprite, (size + 1) * 10);
        entity.size = size;
        Matter.Composite.add(this.engine.world, [entity.physicsBody]);
    }

    get fruitCount() { return sizes.length; }
}

async function _loadGraphics() {
    await PIXI.Assets.load([
        'graphics/fruits.json',
        'graphics/fruits.png'
    ]);
}


await _loadGraphics();
const sizes = ['cherry.png', 'strawberry.png', 'grapes.png', 'dekopon.png', 'orange.png', 'apple.png', 'pear.png', 'peach.png', 'pineapple.png', 'melon.png', 'watermelon.png'];