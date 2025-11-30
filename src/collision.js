import { Camera } from './camera.js';
import { Entity } from './entities.js';
import { drawRectStroke } from './render.js';
import { vec2, Vector2 } from './vector2.js';

/**
* @param {CanvasRenderingContext2D} ctx 
* @param {Camera} camera
* @param {{ x: number, y: number }} position coordenada no espaço da tela
* @param {{ x: number, y: number }} dimensions em pixel
* @param {string?} color
* @param {boolean?} centered
*/
export const drawRectBorder = (ctx, camera, position, dimensions, color = 'white', centered = true) => {
  const lineWidth = 2;
  let x = position.x - camera.position.x + ctx.canvas.width / 2;
  let y = position.y - camera.position.y + ctx.canvas.height / 2;
  
  if (centered) {
    x -= dimensions.x / 2;
    y -= dimensions.y / 2;
  }

  ctx.setLineDash([lineWidth, lineWidth])
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, dimensions.x, dimensions.y);
}

export class CollisionShape {
  color = 'black';

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Camera} camera
   * @param {{ x: number, y: number }} center centro da figura no 'world space'
   */
  render(ctx, camera, center) {}
}

export class RectCollisionShape extends CollisionShape {
  dimensions = vec2(10, 10);

  render(ctx, camera, center) {
    // @note 'World space' pra 'screen space'
    const x = (center.x - this.dimensions.x / 2) - camera.position.x + ctx.canvas.width / 2;
    const y = (center.y - this.dimensions.y / 2) - camera.position.y + ctx.canvas.height / 2;

    drawRectStroke(ctx, x, y, this.dimensions.x, this.dimensions.y, 2, this.color)
  }
}

export class BoundingRect {
  position;
  dimensions;

  /**
   * 
   * @param {Vector2} position 
   * @param {Vector2} dimension 
   */
  constructor(position, dimension) {
    this.position = position;
    this.dimensions = dimension;
  }

  /**
   * 
   * @param {BoundingRect} rect 
   * @returns {boolean}
   */
  isIntersecting(rect) {
    const aHalfDimension = this.dimensions.x / 2;
    const bHalfDimension = rect.dimensions.x / 2;
    const aYHalfDimension = this.dimensions.y / 2;
    const bYHalfDimension = rect.dimensions.y / 2;
    
    const aXStart = this.position.x - aHalfDimension;
    const aXEnd = this.position.x + aHalfDimension;
    const bXStart = rect.position.x - bHalfDimension;
    const bXEnd = rect.position.x + bHalfDimension;

    const aYStart = this.position.y - aYHalfDimension;
    const aYEnd = this.position.y + aYHalfDimension;
    const bYStart = rect.position.y - bYHalfDimension;
    const bYEnd = rect.position.y + bYHalfDimension;

    return ((aXStart >= bXStart && aXStart <= bXEnd) || (aXEnd >= bXStart && aXEnd <= bXEnd)) &&
      ((aYStart >= bYStart && aYStart <= bYEnd) || (aYEnd >= bYStart && aYEnd <= bYEnd));
  }

}
