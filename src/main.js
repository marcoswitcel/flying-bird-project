import { Camera } from './camera.js';
import { CollisionShape, RectCollisionShape } from './collision.js';
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

// @note Terminar de implementar
const img = new Image();
const birdSprite = new Sprite(img);

img.src = './assets/image/bird/idle/frame-1.png';
img.onload = () => {
  birdSprite.width = img.width;
  birdSprite.height = img.height;
};

const pipeImg = new Image();
const pipeSprite = new Sprite(pipeImg);
pipeImg.src = './assets/image/pipe/pipe.svg';
pipeImg.onload = () => {
  pipeSprite.width = pipeImg.width;
  pipeSprite.height = pipeImg.height;
};

resourceManager.add('./assets/image/pipe/pipe.svg', 'image','pipe');



class Entity {
  type = 'Entity';
  centered = true;
  position = vec2();
  /**
   * @type {CollisionShape|null}
   */
  collisionShape = null;

  /**
   * @type {Sprite|null}
   */
  sprite = null;
  /**
   * @type {Vector2}
   */
  dimension = vec2(0, 0);

  /**
   * 
   * @param {Camera} camera 
   */
  isVisible(camera) {
    // @todo João, não funciona
    return (this.position.x >= (camera.position.x - camera.dimensions.x / 2) && this.position.x <= (camera.position.x + camera.dimensions.x / 2)) &&
      (this.position.y >= (camera.position.y - camera.dimensions.y / 2) && this.position.y <= (camera.position.y + camera.dimensions.y / 2));
  }

  render(ctx, camera) {
    if (!this.sprite) return;

    const x = (this.position.x) - camera.position.x + ctx.canvas.width / 2;
    const y = (this.position.y) - camera.position.y + ctx.canvas.height / 2;

    this.sprite.render(ctx, { x: x, y: y }, this.dimension, this.centered);
  }
}

class PipeEntity extends Entity {
  type = 'PipeEntity';
  collisionShape = new RectCollisionShape();

  constructor() {
    super();
    this.sprite = resourceManager.getSprite('pipe');
  }
}

class BirdEntity extends Entity {
  type = 'BirdEntity';
  collisionShape = new RectCollisionShape();
  velocity = vec2(0, 0);
  accel = vec2(0, 0);

  constructor() {
    super();
    this.collisionShape.color = 'yellow';
  }
}

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
pipe.collisionShape.dimensions.x = 25;
pipe.collisionShape.dimensions.y = 100;
pipe.dimension = vec2(80, 120);
const pipe2 = new PipeEntity();
pipe2.position.x = 350;
pipe2.position.y = 325;
pipe2.collisionShape.dimensions.x = 25;
pipe2.collisionShape.dimensions.y = 150;
pipe2.dimension = vec2(75, 150);
const bird = new BirdEntity();
bird.sprite = birdSprite;
bird.dimension = vec2(75, 65);

entities.push(pipe);
entities.push(pipe2);
entities.push(bird);

let paused = false;
let freeCamera = false;

document.addEventListener('click', () => {
  if (paused || freeCamera) return;

  bird.velocity.y = -4;
});

/**
 * @type {Vector2 | null} 
 */
let mousedown = null;
document.addEventListener('mouseup', (event) => {
  mousedown = null;
});
document.addEventListener('mousedown', (event) => {
  mousedown = vec2(event.screenX, event.screenY);
});
document.addEventListener('mousemove', (event) => {
  if (!mousedown || !freeCamera) return;

  const deltaMove = vec2(event.screenX, event.screenY)
    .sub(mousedown);

  mousedown = vec2(event.screenX, event.screenY);

  camera.position.add(deltaMove.mulScalar(-1));
})

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyP': {
      paused = !paused;
    }; break;
    case 'KeyD': {
      freeCamera = !freeCamera;
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
    
    // console.log(entity.isVisible(camera))
  }

  // render
  for (const entity of entities) {
    entity.render(ctx, camera);

    if (entity.collisionShape) {
      entity.collisionShape.render(ctx, camera, entity.position);
    }
  }

  requestAnimationFrame(loop)
});


