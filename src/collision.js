import { Camera } from './camera.js';
import { drawRectStroke } from './render.js';
import { vec2 } from './vector2.js';

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
