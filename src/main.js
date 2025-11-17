
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

const vec2 = (x, y) => ({ x, y });

class Shape {
  color = 'black';
  dimensions = vec2();
}


class Entity {
  position = vec2();
  shape = new Shape();
}

const entities = [];
const pipe = new Entity();
pipe.position.x = 10;
pipe.position.y = 10;
pipe.shape.dimensions.x = 10;
pipe.shape.dimensions.y = 100;

entities.push(pipe);



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
    if (entity.shape) {
      drawRect(ctx, entity.position.x, entity.position.y, entity.shape.dimensions.x, entity.shape.dimensions.y, entity.shape.color)
    }
  }

  requestAnimationFrame(loop)
});


