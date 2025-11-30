import { Camera } from './camera.js';
import { BoundingRect, CollisionShape, RectCollisionShape } from './collision.js';
import { resourceManager } from './resource-manager.js';
import { Sprite } from './sprite.js';
import { vec2, Vector2 } from './vector2.js';


let idSequence = 0;
export class Entity {
  /**
   * @type {number}
   */
  id = idSequence++;
  type;
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

  constructor() {
    this.type = this.constructor.name;
  }

  /**
   * 
   * @param {Camera} camera 
   */
  isVisible(camera) {
    // @todo João, não funciona
    return (this.position.x >= (camera.position.x - camera.dimensions.x / 2) && this.position.x <= (camera.position.x + camera.dimensions.x / 2)) &&
      (this.position.y >= (camera.position.y - camera.dimensions.y / 2) && this.position.y <= (camera.position.y + camera.dimensions.y / 2));
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Camera} camera 
   * @returns 
   */
  render(ctx, camera) {
    if (!this.sprite) return;

    const x = (this.position.x) - camera.position.x + ctx.canvas.width / 2;
    const y = (this.position.y) - camera.position.y + ctx.canvas.height / 2;

    this.sprite.render(ctx, { x: x, y: y }, this.dimension, this.centered);
  }

  /**
   * Serializa os dados para gerar a versão do level
   * @returns 
   */
  serialize() {
    return JSON.stringify(this);
  }

  getVisibleRect() {
    return new BoundingRect(this.position, this.dimension);
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
    this.sprite = resourceManager.getSprite('bird');;
    this.dimension = vec2(75, 65);
  }
}

export class TiledEntity extends Entity {
  type = 'TiledEntity';
  collisionShape = new RectCollisionShape();

  constructor() {
    super();
    this.position.x = 0;
    this.position.y = 525;
    // @toodo João, avaliar como usar o createPattern pra replicar a imagem e ter apenas uma entidade grande para o chão
    this.sprite = resourceManager.getSprite('floor');;
    // @todo João, otimizar para não desenhar fora da tela e não computar, testar com valores altos no 'x', tipo, 100000
    this.dimension.x = 5;
    this.dimension.y = 1;

    this.collisionShape = new RectCollisionShape();
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Camera} camera 
   * @returns 
   */
  render(ctx, camera) {
    if (!this.sprite) return;

    // @todo João, não deveria recomputar isso toda vez, porém na hora de criação da entidade não é garantido que a largura
    // do sprite já seja conhecida, ela depende do carregamento da imagem... Isso vai mudar eventualmente, por hora fica assim.
    this.collisionShape.dimensions.x = this.sprite.width * this.dimension.x;
    this.collisionShape.dimensions.y = this.sprite.height * this.dimension.y;

    const x = (this.position.x - (this.dimension.x * this.sprite.width) / 2) - camera.position.x + ctx.canvas.width / 2;
    const y = (this.position.y - (this.dimension.y * this.sprite.height) / 2) - camera.position.y + ctx.canvas.height / 2;

    const dimensions = { x: this.sprite.width, y: this.sprite.height };
    let position = { x: 0, y: 0 };

    for (let i = 0; i < this.dimension.x; i++) {
      for (let j = 0; j < this.dimension.y; j++) {
        position.x = x + this.sprite.width * i;
        position.y = y + this.sprite.height * j;

        this.sprite.render(ctx, position, dimensions, false);
      }
    }
  }

  getVisibleRect() {
    return new BoundingRect(this.position, { x: this.dimension.x * this.sprite.width, y: this.dimension.y * this.sprite.height, });
  }
}
