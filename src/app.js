// Entry point of the application.

import { Label } from './label.js';
import { SoundManager } from './soundManager.js';
import { Crane } from './crane.js';
import { FruitFactory } from './fruitFactory.js';

// Window bounds
const BOUNDS = vec4.fromValues(0, 0, 1280, 800);

function initBucket() {
    const sprite = PIXI.Sprite.from('bucket.png');
    app.stage.addChild(sprite);
    sprite.x = app.screen.width / 2 - sprite.width / 2;
    sprite.y = app.screen.height - sprite.height - 20;
    const bucketGround = Bodies.rectangle(sprite.x + sprite.width / 2, sprite.y + sprite.height + 25, sprite.width, 50, { isStatic: true });
    const bucketLeftWall = Bodies.rectangle(sprite.x, sprite.y + sprite.height / 2, 10, sprite.height, { isStatic: true });
    const bucketRightWall = Bodies.rectangle(sprite.x + sprite.width + 10, sprite.y + sprite.height / 2, 10, sprite.height, { isStatic: true });
    Composite.add(engine.world, [bucketGround, bucketLeftWall, bucketRightWall]);
    return sprite;
}

function initCrane() {
    const startPos = vec2.fromValues(bucket.x + bucket.width / 2, bucket.y - 20);
    const range = vec2.fromValues(bucket.x + 10, bucket.x + bucket.width - 10);
    const sprite = PIXI.Sprite.from('crane.png');
    const crane = new Crane(engine, app.stage, startPos, range, sprite, fruitFactory);
    return crane;
}

async function merge(e1, e2) {
    soundManager.zzup();
    // remove colliders
    Matter.World.remove(engine.world, e1.physicsBody);
    Matter.World.remove(engine.world, e2.physicsBody);

    // merge fruits
    e1.isDestroyed = true;
    e2.isDestroyed = true;
    e1.targetEntity = e2;
    e2.targetEntity = e1;
    const mergeDist = (e1.radius + e2.radius) / 2;
    while (vec2.dist(e1.positionVec2, e2.positionVec2) > mergeDist) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // spawn new fruit
    score += e1.size + 1;
    const combinedPosition = vec2.fromValues((e1.position.x + e2.position.x) / 2, (e1.position.y + e2.position.y) / 2);
    const size = e1.size + 1;
    fruitFactory.spawnFruit(combinedPosition, size);

    // destroy old fruits
    e1.destroy();
    e2.destroy();
    soundManager.puh();
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

// Physics
const Engine = Matter.Engine;
const engine = Engine.create();
const Runner = Matter.Runner;
const runner = Runner.create();
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;

Matter.Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
        if ('entity' in collision.bodyA && 'entity' in collision.bodyB) {
            const e1 = collision.bodyA.entity;
            const e2 = collision.bodyB.entity;
            if (e1.size < fruitFactory.fruitCount && e1.size == e2.size && !e1.isDestroyed && !e2.isDestroyed) {
                merge(collision.bodyA.entity, collision.bodyB.entity);
            } else {
                playPlopp(collision);
            }
        } else {
            playPlopp(collision);
        }
    });
});
Runner.run(runner, engine);

// Game logics
let score = 0;
// await new Promise(resolve => setTimeout(resolve, 1000));
const fruitFactory = new FruitFactory(app, engine);
const soundManager = new SoundManager();
const bucket = initBucket();
const crane = initCrane();
const label = new Label(app.ticker, app.stage, { x: 70, y: 50 }, getScore);
const face = PIXI.Sprite.from('marco.png');
face.anchor.x = 0.5;
face.anchor.y = 0.5;
face.x = 40;
face.y = 66;
app.stage.addChild(face);


function playPlopp(collision) {
    const vel1 = vec2.fromValues(collision.bodyA.velocity.x, collision.bodyA.velocity.y);
    const vel2 = vec2.fromValues(collision.bodyB.velocity.x, collision.bodyB.velocity.y);
    if (vec2.sqrLen(vel1) + vec2.sqrLen(vel2) > 50) {
        soundManager.plopp();
    }
}
