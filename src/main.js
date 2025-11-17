
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
   * @param {{ x: number, y: number }} center 
   */
  render(ctx, center) {}
}

class RectCollisionShape extends CollisionShape {
  dimensions = vec2(10, 10);

  render(ctx, center) {
    drawRectStroke(ctx, center.x, center.y, this.dimensions.x, this.dimensions.y, 2, this.color)
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
    this.accel = vec2(0, 0.1)
  }
}

/**
 * @type {Entity[]}
 */
const entities = [];
const pipe = new PipeEntity();
pipe.position.x = 250;
pipe.position.y = 325;
pipe.collisionShape.dimensions.x = 25;
pipe.collisionShape.dimensions.y = 100;
const bird = new BirdEntity();

entities.push(pipe);
entities.push(bird);



let lastTimestamp = 0;
requestAnimationFrame(function loop(timestamp) {
  if (lastTimestamp === 0)
  {
    lastTimestamp = timestamp;
    requestAnimationFrame(loop)  
    return;
  }

  drawRect(ctx, 0, 0, canvas.width, canvas.height, 'blue');

  for (const entity of entities) {
    if (entity instanceof BirdEntity) {
      entity.velocity.add(entity.accel);
      entity.position.add(entity.velocity);
    }
  }

  // render
  for (const entity of entities) {
    if (entity.collisionShape) {
      entity.collisionShape.render(ctx, entity.position);
    }
  }

  requestAnimationFrame(loop)
});


