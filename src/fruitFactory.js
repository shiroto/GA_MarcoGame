import { Entity } from './entity.js';

export class FruitFactory {
    constructor(app, engine) {
        this.app = app;
        this.engine = engine;
    }

    createFruit(point) {
        const size = getRandomInt(0, 5);
        const startPos = vec2.fromValues(point[0], point[1]);
        const sprite = PIXI.Sprite.from(sizes[size]);
        const entity = new Entity(this.app.ticker, this.app.stage, startPos, sprite, (size + 1) * 10);
        entity.size = size;
        return entity;

    }

    spawnFruit(point, size) {
        const startPos = { x: point[0], y: point[1] };
        const sprite = PIXI.Sprite.from(sizes[size]);
        const entity = new Entity(this.app.ticker, this.app.stage, startPos, sprite, (size + 1) * 10);
        entity.size = size;
        entity.createBody();
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * Math.random() * (max - min) + min);
}

await _loadGraphics();
const sizes = ['cherry.png', 'strawberry.png', 'grapes.png', 'dekopon.png', 'orange.png', 'apple.png', 'pear.png', 'peach.png', 'pineapple.png', 'melon.png', 'watermelon.png'];