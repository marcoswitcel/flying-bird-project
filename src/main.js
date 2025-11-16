
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

drawRect(ctx, 0, 0, canvas.width, canvas.height, 'blue');

drawRect(ctx, 0, 0, 10, 100, 'green')


