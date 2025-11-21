import { Sprite } from './sprite.js';

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


/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @param {string} color 
 */
const drawRect = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @param {number} lineWidth 
 * @param {string} color 
 */
const drawRectStroke = (ctx, x, y, w, h, lineWidth, color) => {
  ctx.setLineDash([lineWidth, lineWidth])
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, w, h);
}

class Vector2 {
  /**
   * @type {number}
   */
  x;
  /**
   * @type {number}
   */
  y;
 
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  addScalar(number) {
    this.x += number;
    this.y += number;

    return this;
  }

  add(vec) {
    this.x += vec.x;
    this.y += vec.y;

    return this;
  }

  subScalar(number) {
    this.x -= number;
    this.y -= number;

    return this;
  }

  sub(vec) {
    this.x -= vec.x;
    this.y -= vec.y;

    return this;
  }

  mulScalar(x, y = x) {
    this.x *= x;
    this.y *= y;

    return this;
  }

  mul(vec) {
    this.x *= vec.x;
    this.y *= vec.y;

    return this;
  }
}

const vec2 = (x = 0, y = 0) => new Vector2(x, y);

class CollisionShape {
  color = 'black';

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Camera} camera
   * @param {{ x: number, y: number }} center centro da figura no 'world space'
   */
  render(ctx, camera, center) {}
}

class RectCollisionShape extends CollisionShape {
  dimensions = vec2(10, 10);

  render(ctx, camera, center) {
    // @note 'World space' pra 'screen space'
    const x = (center.x - this.dimensions.x / 2) - camera.position.x + ctx.canvas.width / 2;
    const y = (center.y - this.dimensions.y / 2) - camera.position.y + ctx.canvas.height / 2;

    drawRectStroke(ctx, x, y, this.dimensions.x, this.dimensions.y, 2, this.color)
  }
}

class Camera {
  position = vec2();
  dimensions = vec2(100, 100);
}


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
pipe.sprite = pipeSprite;
pipe.dimension = vec2(80, 120);
const pipe2 = new PipeEntity();
pipe2.position.x = 350;
pipe2.position.y = 325;
pipe2.collisionShape.dimensions.x = 25;
pipe2.collisionShape.dimensions.y = 150;
pipe2.sprite = pipeSprite;
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

  if (!paused && !freeCamera)
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


