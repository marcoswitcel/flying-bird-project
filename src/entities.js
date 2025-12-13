import { Camera } from './camera.js';
import { BoundingRect, CollisionShape, RectCollisionShape } from './collision.js';
import { resourceManager } from './resource-manager.js';
import { AnimatedSprite } from './sprite.js';
import { vec2, Vector2 } from './vector2.js';


export const RUNTIME_ID_SEQUENCE_START = 60000;

let exportedIdSequence = 0;
let runtimeIdSequence = RUNTIME_ID_SEQUENCE_START;
export const exportedIdGenerator = () => exportedIdSequence++;
const runtimeIdGenerator = () => runtimeIdSequence++;

export class Entity {
  /**
   * @type {number}
   */
  id = runtimeIdGenerator();
  type;
  centered = true;
  position = vec2();
  /**
   * @type {CollisionShape|null}
   */
  collisionShape = null;

  /**
   * @type {import('./sprite.js').RenderableSprite|null}
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
    return JSON.stringify(this.exportableObject(), null, 2);
  }

  exportableObject() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      collisionShape: this.collisionShape,
      dimension: this.dimension,
    };
  }

  getVisibleRect() {
    return new BoundingRect(this.position, this.dimension);
  }

  initialState() {}
}

export class PipeEntity extends Entity {
  collisionShape = new RectCollisionShape();
  birdPassedThrough = false;
  isUpsideDown=false;

  constructor() {
    super();
    this.collisionShape.dimensions.x = 25;
    this.collisionShape.dimensions.y = 150;
    this.dimension = vec2(75, 150);
    this.updateSprite();
  }

  updateSprite() {
    this.sprite = (this.isUpsideDown) ? resourceManager.getSprite('upside-down-pipe') : resourceManager.getSprite('pipe');
  }

  initialState() {
    this.birdPassedThrough = false;
  }

  exportableObject() {
    const object = super.exportableObject();
    object.isUpsideDown = this.isUpsideDown;

    return object;
  }
}

export class BirdEntity extends Entity {
  collisionShape = new RectCollisionShape();
  velocity = vec2(0, 0);
  accel = vec2(0, 0);
  /**
   * @type {import('./sprite.js').RenderableSprite|null}
   */
  sprite;
  hitted = false;

  constructor() {
    super();
    this.collisionShape.color = 'yellow';
    this.sprite = resourceManager.getSprite('bird');;
    this.dimension = vec2(75, 65);
    this.initialState();
  }

  initialState() {
    this.position = vec2(0, 0);
    this.velocity = vec2(0, 0);
    this.accel = vec2(0, 0);
    this.hitted = false;
    this.sprite = new AnimatedSprite([ resourceManager.getSprite('bird.1'), resourceManager.getSprite('bird.2'), resourceManager.getSprite('bird.3'), resourceManager.getSprite('bird.4') ], 250);
  }

  gotHit() {
    this.hitted = true;
    this.sprite = resourceManager.getSprite('bird.hit');
  }
}

export class TiledEntity extends Entity {
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

export class ParallaxEntity extends Entity {
  /**
   * @type {{ sprite: import('./sprite.js').RenderableSprite, dt: number }[] | null}
   */
  backgrounds = null;
  centered = true;

  constructor() {
    super();
    this.backgrounds = [
      { sprite: resourceManager.getSprite('moutains'), dt: 0.2 },
      { sprite: resourceManager.getSprite('clouds'), dt: 0.1 },
    ];
    this.position.y = 300;
    // @note João, deveria ser ignorado
    this.position.x = 0;
    this.dimension.x = 1123;
    this.dimension.y = 794;
  }

  render(ctx, camera) {
    // mantendo a área visível alinhada com a renderização em relação a câmera câmera
    this.position.x = camera.position.x;

    // @todo João, preciso definir a velocidade de transição ou a área visívil da entidade de parallax
    // const x = (this.position.x) - camera.position.x + ctx.canvas.width / 2;
    const x = ctx.canvas.width / 2;
    const y = (this.position.y) - camera.position.y + ctx.canvas.height / 2;
    
    // @todo João, funciona, só que o reset não é suave, acho que daria ou pra exportar uma textura que seja simétrica ou
    // ensinar a duplica a textura pra ela entrar pela direita de novo
    const width = this.dimension.x;
    for (const bg of this.backgrounds) {
      const delta = bg.dt;
      const m = camera.position.x % Math.floor(width / delta);
      bg.sprite.render(ctx, { x: x - (delta * m), y: y }, this.dimension, this.centered);
    }
  }

  // @note João, hack pra não ser selecionável
  getVisibleRect() {
    return new BoundingRect(this.position, { x: 0, y: 0});
  }
}

const is = (type, value) => typeof value === type;

/**
 * 
 * @param {object} json 
 * @returns {Entity[]}
 */
export const processLevelData = (json) => {
  const entities = [];
  const ids = new Set();

  for (const entry of json.world.entities) {
    /**
     * @type {Entity}
     */
    let entity;
    
    if (entry.type === 'PipeEntity') {
      entity = new PipeEntity();
    } else if (entry.type === 'TiledEntity') {
      entity = new TiledEntity();
    } else {
      console.log('Object ignorado. Tipo: ' + entry.type)
      continue;
    }

    if (is('number', entry.id)) {
      entity.id = entry.id;
      
      console.assert(!ids.has(entity.id), 'Id duplicado detectado. Id: ' + entity.id);
      ids.add(entity.id);
      console.assert(entity.id < RUNTIME_ID_SEQUENCE_START, 'Id fora do range correto. Id: ' + entity.id);
    }
    
    
    if (is('object', entry.position) && is('number', entry.position.x) && is('number', entry.position.y)) {
      entity.position.x = entry.position.x;
      entity.position.y = entry.position.y;
    }

    if (is('object', entry.dimension) &&
      is('number', entry.dimension.x) &&
      is('number', entry.dimension.y)) {
      entity.dimension.x = entry.dimension.x;
      entity.dimension.y = entry.dimension.y;
    }


    if (is('object', entry.collisionShape) &&
      is('object', entry.collisionShape.dimensions) &&
      is('number', entry.collisionShape.dimensions.x) &&
      is('number', entry.collisionShape.dimensions.y) &&
      entity instanceof PipeEntity) {
      entity.collisionShape.dimensions.x = entry.collisionShape.dimensions.x;
      entity.collisionShape.dimensions.y = entry.collisionShape.dimensions.y;
    }

    if (is('boolean', entry.isUpsideDown) &&  entity instanceof PipeEntity) {
      entity.isUpsideDown =  entry.isUpsideDown;
      entity.updateSprite();
    }

    entities.push(entity);
  }

  return entities;
}
