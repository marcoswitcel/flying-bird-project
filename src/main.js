import { Camera } from './camera.js';
import { BoundingRect, CollisionShape, RectCollisionShape } from './collision.js';
import { BirdEntity, Entity, TiledEntity, PipeEntity } from './entities.js';
import { drawRect, drawRectStroke } from './render.js';
import { resourceManager } from './resource-manager.js';
import { Sprite } from './sprite.js';
import { vec2, Vector2 } from './vector2.js';

console.log('Olá mundo dos games de pássaros!');

const canvas = document.createElement('canvas');

canvas.width = 400;
canvas.height = 520;

document.body.append(canvas);

const ctx = canvas.getContext('2d');

resourceManager.add('./assets/image/pipe/pipe.svg', 'image','pipe');
resourceManager.add('./assets/image/bird/idle/frame-1.png', 'image','bird');
resourceManager.add('./assets/image/floor/floor.svg', 'image','floor');


const camera = new Camera();
camera.position.x = ctx.canvas.width / 2;
camera.position.y = ctx.canvas.height / 2;

/**
 * @type {Entity[]}
 */
const entities = [];
const pipe = new PipeEntity();
pipe.position.x = 250;
pipe.position.y = 325;
const pipe2 = new PipeEntity();
pipe2.position.x = 350;
pipe2.position.y = 325;
const bird = new BirdEntity();
const floor = new TiledEntity();

entities.push(pipe);
entities.push(pipe2);
entities.push(bird);
entities.push(floor);

let paused = false;
let freeCamera = false;
let isShowCollider = false;
let isRenderSprite = true;
let isShowMemory = false;

document.addEventListener('click', () => {
  if (paused || freeCamera) return;

  bird.velocity.y = -4;
});

/**
 * @type {Vector2 | null} 
 */
let mousedown = null;
let mouseMoved = false;
document.addEventListener('mouseup', (event) => {
  if (freeCamera && !mouseMoved) {
    // @todo João, mover esse código
    const clickInWorldSpace = camera.position
      .copy()
      .add(mousedown.copy().subScalar(canvas.width / 2, canvas.height / 2));
    
    let found = false;
    for (const entity of entities) {
      if (Math.abs(clickInWorldSpace.x - entity.position.x) <= entity.dimension.x / 2 && Math.abs(clickInWorldSpace.y - entity.position.y) <= entity.dimension.y / 2) {
        console.log(entity);
        found = true;
      }
    }

    if (!found) {
      const pipe = new PipeEntity();
      pipe.position = clickInWorldSpace.copy();
      entities.push(pipe);
    }
  }

  mousedown = null;
  mouseMoved = false;
});
document.addEventListener('mousedown', (event) => {
  mousedown = vec2(event.offsetX, event.offsetY);
  mouseMoved = false;
});
document.addEventListener('mousemove', (event) => {
  if (!mousedown || !freeCamera) return;

  const deltaMove = vec2(event.offsetX, event.offsetY)
    .sub(mousedown);

  mousedown = vec2(event.offsetX, event.offsetY);
  mouseMoved = true;

  camera.position.add(deltaMove.mulScalar(-1));
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
      freeCamera = !freeCamera;
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
      entity.velocity.x = 1;
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

      // @todo João, terminar de ajustar aqui, não colidindo corretamente
      entity.collisionShape.color = rectBird.isIntersecting(rectEntity) ? 'red' : 'black';
    }
  }

  // render
  for (const entity of entities) {
    if (isRenderSprite) entity.render(ctx, camera);

    if (isShowCollider && entity.collisionShape) {
      entity.collisionShape.render(ctx, camera, entity.position);
    }
  }

  const endTime = performance.now();

  if (isShowMemory && performance.memory) {
    ctx.fillStyle = 'white';
    ctx.font = '24px serif';
    ctx.fillText('JS Heap: ' + performance.memory.usedJSHeapSize, 25, 25);
    ctx.fillText('JS Heap Total: ' + performance.memory.totalJSHeapSize, 25, 45);
    ctx.fillText('Time: ' + (endTime - starTime).toFixed(4), 25, 65);
  }

  requestAnimationFrame(loop)
});

