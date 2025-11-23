import { Camera } from './camera.js';
import { CollisionShape, RectCollisionShape } from './collision.js';
import { resourceManager } from './resource-manager.js';
import { Sprite } from './sprite.js';
import { vec2, Vector2 } from './vector2.js';

export class Entity {
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

export class PipeEntity extends Entity {
  type = 'PipeEntity';
  collisionShape = new RectCollisionShape();

  constructor() {
    super();
    this.sprite = resourceManager.getSprite('pipe');
    this.collisionShape.dimensions.x = 25;
    this.collisionShape.dimensions.y = 150;
    this.dimension = vec2(75, 150);
  }
}

export class BirdEntity extends Entity {
  type = 'BirdEntity';
  collisionShape = new RectCollisionShape();
  velocity = vec2(0, 0);
  accel = vec2(0, 0);

  constructor() {
    super();
    this.collisionShape.color = 'yellow';
  }
}