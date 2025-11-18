
console.log('Olá mundo dos games de pássaros!');

const canvas = document.createElement('canvas');

canvas.width = 360;
canvas.height = 480;

document.body.append(canvas);

const ctx = canvas.getContext('2d');

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
  }

  add(vec) {
    this.x += vec.x;
    this.y += vec.y;
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
   * 
   * @param {Camera} camera 
   */
  isVisible(camera) {
    // @todo João, não funciona
    return (this.position.x >= (camera.position.x - camera.dimensions.x / 2) && this.position.x <= (camera.position.x + camera.dimensions.x / 2)) &&
      (this.position.y >= (camera.position.y - camera.dimensions.y / 2) && this.position.y <= (camera.position.y + camera.dimensions.y / 2));
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
const pipe2 = new PipeEntity();
pipe2.position.x = 350;
pipe2.position.y = 325;
pipe2.collisionShape.dimensions.x = 25;
pipe2.collisionShape.dimensions.y = 150;
const bird = new BirdEntity();

entities.push(pipe);
entities.push(pipe2);
entities.push(bird);

let paused = false;

document.addEventListener('click', () => {
  bird.accel.y = -9.8;
});

document.addEventListener('keyup', (event) => {
  if (event.code === 'KeyP') {
    paused = !paused;
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
      camera.position.x = entity.position.x + 100;
    }
    
    // console.log(entity.isVisible(camera))
  }

  // render
  for (const entity of entities) {
    if (entity.collisionShape) {
      entity.collisionShape.render(ctx, camera, entity.position);
    }
  }

  requestAnimationFrame(loop)
});


