// Entry point of the application.

import { Entity } from './entity.js';
import { InputHandler } from './inputHandler.js';
import { Label } from './label.js';

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
    const bucketGround = Bodies.rectangle(sprite.x + sprite.width / 2, sprite.y + sprite.height + 25, sprite.width, 50, { isStatic: true });
    const bucketLeftWall = Bodies.rectangle(sprite.x, sprite.y + sprite.height / 2, 10, sprite.height, { isStatic: true });
    const bucketRightWall = Bodies.rectangle(sprite.x + sprite.width + 10, sprite.y + sprite.height / 2, 10, sprite.height, { isStatic: true });
    Composite.add(engine.world, [bucketGround, bucketLeftWall, bucketRightWall]);
}

function spawnCherry(point) {
    const startPos = vec2.fromValues(point.x, point.y);
    const size = 0;
    const sprite = PIXI.Sprite.from(sizes[size]);
    const entity = new Entity(app.ticker, app.stage, startPos, sprite, (size + 1) * 10, merge);
    entity.size = size;
    Composite.add(engine.world, [entity.physicsBody]);
}

function merge(e1, e2) {
    puh.play();
    score += e1.size + 1;
    const startPos = vec2.fromValues((e1.position.x + e2.position.x) / 2, (e1.position.y + e2.position.y) / 2);
    const size = e1.size + 1;
    const sprite = PIXI.Sprite.from(sizes[size]);
    const entity = new Entity(app.ticker, app.stage, startPos, sprite, (size + 1) * 10, merge);
    entity.size = size;
    Composite.add(engine.world, [entity.physicsBody]);
    e1.destroy();
    Matter.World.remove(engine.world, e1.physicsBody);
    e2.destroy();
    Matter.World.remove(engine.world, e2.physicsBody);
}

function getScore() {
    return score.toString();
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
const engine = Engine.create();
const Runner = Matter.Runner;
const runner = Runner.create();
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

let score = 0;
await _loadGraphics();
const sizes = ['cherry.png', 'strawberry.png', 'grapes.png', 'dekopon.png', 'orange.png', 'apple.png', 'pear.png', 'peach.png', 'pineapple.png', 'melon.png', 'watermelon.png'];
initBucket();
const label = new Label(app.ticker, app.stage, { x: 70, y: 50 }, getScore);
const face = PIXI.Sprite.from('marco.png');
face.anchor.x = 0.5;
face.anchor.y = 0.5;
face.x = 40;
face.y = 66;
app.stage.addChild(face);

Matter.Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
        if ('entity' in collision.bodyA && 'entity' in collision.bodyB) {
            const e1 = collision.bodyA.entity;
            const e2 = collision.bodyB.entity;
            if (e1.size < sizes.length && e1.size == e2.size && !e1.isDestroyed && !e2.isDestroyed) {
                merge(collision.bodyA.entity, collision.bodyB.entity);
            } else {
                playPlopp(collision);
            }
        } else {
            playPlopp(collision);
        }
    });
});

function playPlopp(collision) {
    const vel1 = vec2.fromValues(collision.bodyA.velocity.x, collision.bodyA.velocity.y);
    const vel2 = vec2.fromValues(collision.bodyB.velocity.x, collision.bodyB.velocity.y);
    if (vec2.sqrLen(vel1) + vec2.sqrLen(vel2) > 50) {
        if (!plopp.playing()) {
            plopp.play();
        }
    }
}

Runner.run(runner, engine);

const plopp = new Howl({
    src: ['graphics/plopp.mp3'],
    volume: 0.2,
});

const puh = new Howl({
    src: ['graphics/puh.mp3'],
    volume: 0.2,
});

// Create an audio sprite with the melody
const melody = new Howl({
    src: ['graphics/background.mp3'],
    sprite: {
        loop: [0, 5000],
    },
    loop: true, // Enable loop
    volume: 0.05, // Adjust volume as needed
});

// Start playing the melody
melody.play('loop');