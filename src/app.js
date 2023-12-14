// Entry point of the application.

import { Entity } from './entity.js';
import { InputHandler } from './inputHandler.js';
import { CollisionSystem } from './collisionSystem.js';

// Window bounds
const BOUNDS = vec4.fromValues(0, 0, 1280, 800);


async function _loadGraphics() {
    await PIXI.Assets.load([
        'graphics/fruits.json',
        'graphics/fruits.png'
    ]);
}

function initBucket() {
    const sprite = PIXI.Sprite.from('bucket.png');
    app.stage.addChild(sprite);
    sprite.x = app.screen.width / 2 - sprite.width / 2;
    sprite.y = app.screen.height - sprite.height - 20;
    const bucketGround = Matter.Bodies.rectangle(sprite.x + sprite.width / 2, sprite.y + sprite.height, sprite.width, 10, { isStatic: true });
    const bucketLeftWall = Matter.Bodies.rectangle(sprite.x, sprite.y + sprite.height / 2, 10, sprite.height, { isStatic: true });
    const bucketRightWall = Matter.Bodies.rectangle(sprite.x + sprite.width + 10, sprite.y + sprite.height / 2, 10, sprite.height, { isStatic: true });
    Composite.add(engine.world, [bucketGround, bucketLeftWall, bucketRightWall]);
    // collisionSystem.setBucket(sprite);
}

function spawnCherry(point) {
    const startPos = vec2.fromValues(point.x, point.y);
    const size = 0;
    const sprite = PIXI.Sprite.from(sizes[size]);
    const entity = new Entity(app.ticker, app.stage, startPos, sprite, size + 1, merge);
    Composite.add(engine.world, [entity.physicsBody]);
    // collisionSystem.registerToFruitLayer(entity);
}

function merge(e1, e2) {
    if (e1.mass == sizes.length) {
        return;
    }
    const startPos = vec2.add(vec2.create(), e1.position, e2.position);
    vec2.scale(startPos, startPos, 0.5);
    const sprite = PIXI.Sprite.from(sizes[e1.mass]);
    const entity = new Entity(app.ticker, app.stage, startPos, sprite, e1.mass + 1, merge);
    entity.velocity = vec2.add(vec2.create(), e1.velocity, e2.velocity);
    collisionSystem.registerToFruitLayer(entity);
    e1.destroy();
    e2.destroy();
}

// Start game logic ->
// Init Pixi application
const app = new PIXI.Application({
    background: '#1099bb',
    width: BOUNDS[2],
    height: BOUNDS[3]
});
// Add to webpage
document.body.appendChild(app.view);

// Init game
const input = new InputHandler(window, spawnCherry);

const Engine = Matter.Engine;
var engine = Engine.create();
console.log(engine.gravity);
const Render = Matter.Render;
const Runner = Matter.Runner;
var runner = Runner.create();
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

// const collisionSystem = new CollisionSystem(app.ticker);
await _loadGraphics();
const sizes = ['cherry.png', 'strawberry.png', 'grapes.png', 'dekopon.png', 'orange.png', 'apple.png', 'pear.png', 'peach.png', 'pineapple.png', 'melon.png', 'watermelon.png'];
initBucket();
// await _initBackground();
// _initPlayer(input);
// _initEnemySpawner();

Runner.run(runner, engine);