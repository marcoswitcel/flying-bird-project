import { Camera } from './camera.js';
import { BoundingRect, CollisionShape, drawRectBorder, RectCollisionShape } from './collision.js';
import { BirdEntity, Entity, TiledEntity, PipeEntity, processLevelData } from './entities.js';
import { drawRect, drawRectStroke } from './render.js';
import { resourceManager } from './resource-manager.js';
import { AnimatedSprite, Sprite } from './sprite.js';
import { vec2, Vector2 } from './vector2.js';

console.log('Olá mundo dos games de pássaros!');

const canvas = document.createElement('canvas');

canvas.width = 400;
canvas.height = 520;

document.body.append(canvas);

const ctx = canvas.getContext('2d');

resourceManager.add('./assets/image/pipe/pipe.svg', 'image','pipe');
resourceManager.add('./assets/image/bird/idle/frame-1.png', 'image','bird');
resourceManager.add('./assets/image/bird/idle/frame-1.png', 'image','bird.1');
resourceManager.add('./assets/image/bird/idle/frame-2.png', 'image','bird.2');
resourceManager.add('./assets/image/bird/idle/frame-3.png', 'image','bird.3');
resourceManager.add('./assets/image/bird/idle/frame-4.png', 'image','bird.4');
resourceManager.add('./assets/image/bird/got-hit/frame-1.png', 'image','bird.hit');
resourceManager.add('./assets/image/floor/floor.svg', 'image','floor');


const camera = new Camera();
camera.position.x = ctx.canvas.width / 2;
camera.position.y = ctx.canvas.height / 2;
camera.dimensions.x = ctx.canvas.width;
camera.dimensions.y = ctx.canvas.height;

/**
 * @type {Entity[]}
 */
const entities = [];
const pipe = new PipeEntity();
pipe.position.x = 250;
pipe.position.y = 405;
const pipe2 = new PipeEntity();
pipe2.position.x = 450;
pipe2.position.y = 405;
pipe2.collisionShape.dimensions.y *= 2;
pipe2.dimension.y *= 2;
const bird = new BirdEntity();
const floor = new TiledEntity();

entities.push(pipe);
entities.push(pipe2);
entities.push(bird);
entities.push(floor);

bird.sprite = new AnimatedSprite([ resourceManager.getSprite('bird.1'), resourceManager.getSprite('bird.2'), resourceManager.getSprite('bird.3'), resourceManager.getSprite('bird.4') ], 250);

let paused = false;
let freeCamera = false;
let isShowCollider = false;
let isShowDimension = false;
let isRenderSprite = true;
let isShowMemory = false;

document.addEventListener('click', () => {
  if (paused || freeCamera) return;

  if (!bird.hitted) {
    bird.velocity.y = -4;
  }
});

/**
 * @type {Vector2 | null} 
 */
let mousedown = null;
let mouseMoved = false;
/**
 * @type {Entity|null}
 */
let selectedEntity = null;
document.addEventListener('mouseup', (event) => {
  if (freeCamera && !mouseMoved && !selectedEntity) {
    // @todo João, mover esse código
    const clickInWorldSpace = camera.position
      .copy()
      .add(mousedown.copy().subScalar(canvas.width / 2, canvas.height / 2));
    const pipe = new PipeEntity();
    pipe.position = clickInWorldSpace.copy();
    entities.push(pipe);
  }

  mousedown = null;
  mouseMoved = false;
});
document.addEventListener('mousedown', (event) => {
  mousedown = vec2(event.offsetX, event.offsetY);
  mouseMoved = false;

  const clickInWorldSpace = camera.position
    .copy()
    .add(mousedown.copy().subScalar(canvas.width / 2, canvas.height / 2));
  
  selectedEntity = null;
  for (const entity of entities) {
    if (entity.getVisibleRect().isInside(clickInWorldSpace)) {
      console.log(entity);
      selectedEntity = entity;
    }
  }
});
document.addEventListener('mousemove', (event) => {
  if (!mousedown || !freeCamera) return;

  const deltaMove = vec2(event.offsetX, event.offsetY)
    .sub(mousedown);

  mousedown = vec2(event.offsetX, event.offsetY);
  mouseMoved = true;

  if (selectedEntity) {
    selectedEntity.position.add(deltaMove);
  } else {
    camera.position.add(deltaMove.mulScalar(-1));
  }
})

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyP': {
      paused = !paused;
    }; break;
    case 'KeyS': {
      isRenderSprite = !isRenderSprite;
    }; break;
    case 'KeyM': {
      isShowMemory = !isShowMemory;
    }; break;
    case 'KeyD': {
      isShowDimension = !isShowDimension;
    }; break;
    case 'KeyF': {
      freeCamera = !freeCamera;
    }; break;
    case 'KeyE': {
      if (selectedEntity) {
        console.log(selectedEntity.serialize());
      }
    }; break;
    case 'KeyO': {
      isShowCollider = !isShowCollider;
    }; break;
  }
});


let lastTimestamp = 0;
requestAnimationFrame(function loop(timestamp) {
  if (lastTimestamp === 0)
  {
    lastTimestamp = timestamp;
    requestAnimationFrame(loop)  
    return;
  }

  const starTime = performance.now();

  drawRect(ctx, 0, 0, canvas.width, canvas.height, 'blue');

  if (!paused)
  for (const entity of entities) {
    if (entity instanceof BirdEntity) {
      // gravidade
      entity.accel.y += 0.15;

      entity.velocity.add(entity.accel);
      // por hora velocidade horizontal fixa
      if (!entity.hitted) {
        entity.velocity.x = 1;
      } else {
        entity.velocity.x = 0;
      }
      entity.position.add(entity.velocity);

      // reset aceleração
      entity.accel.x = 0;
      entity.accel.y = 0;

      // camera seguindo 'bird'
      if (!freeCamera) {
        camera.position.x = entity.position.x + 100;
      }
    }
  }

  if (!paused)
  for (const entity of entities) {
    if (!(entity instanceof BirdEntity) && entity.collisionShape instanceof RectCollisionShape) {
      const rectEntity = new BoundingRect(entity.position, entity.collisionShape.dimensions);
      const rectBird = new BoundingRect(bird.position, bird.collisionShape.dimensions);

      if (rectBird.isIntersecting(rectEntity)) {
        entity.collisionShape.color = 'red';
        bird.hitted = true;
      } else {
        entity.collisionShape.color = 'black';
      }
    }
  }

  // render
  for (const entity of entities) {
    // @todo João, não funcionando para a TiledEntity
    // if (!entity.getVisibleRect().isIntersecting(camera)) continue;
    if (entity instanceof BirdEntity && entity.hitted) {
      entity.sprite = resourceManager.getSprite('bird.hit');
    }

    if (isRenderSprite) entity.render(ctx, camera);

    if (isShowDimension) {
      const dimensions = (entity.type === 'TiledEntity') ? { x: entity.sprite.width * entity.dimension.x, y: entity.sprite.height * entity.dimension.y, } : entity.dimension;
      drawRectBorder(ctx, camera, entity.position, dimensions, 'black', true);
    }

    if (isShowCollider && entity.collisionShape) {
      entity.collisionShape.render(ctx, camera, entity.position);
    }
  }

  const endTime = performance.now();

  // @ts-expect-error
  const memory = performance.memory;
  if (isShowMemory && memory) {
    ctx.fillStyle = 'white';
    ctx.font = '24px serif';
    ctx.fillText('JS Heap: ' + memory.usedJSHeapSize, 25, 25);
    ctx.fillText('JS Heap Total: ' + memory.totalJSHeapSize, 25, 45);
    ctx.fillText('Time: ' + (endTime - starTime).toFixed(4), 25, 65);
  }

  requestAnimationFrame(loop)
});

fetch("../public/level/level01.json")
  .then(response => {
    return response.json();
  })
  .then(json => {
    processLevelData(json);
  })
  .catch((reason) => {
    console.log(reason);
  })
