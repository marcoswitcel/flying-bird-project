import { Camera } from './camera.js';
import { BirdEntity, Entity } from './entities.js';
import { Scene } from './scene.js';

export class GameContext {
  /**
   * @type {Entity[]}
   */
  entities = [];
  bird = new BirdEntity();

  /**
   * @type {Entity|null}
   */
  selectedEntity = null;
  
  /**
   * @type {'running'|'win'|'lose'}
   */
  state = 'running';
  
  counter = 0;
  
  paused = false;
  freeCamera = false;
  isShowCollider = false;
  isShowDimension = false;
  isRenderSprite = true;
  isShowMemory = false;

  camera = new Camera();

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  constructor(ctx) {
    this.camera.position.x = ctx.canvas.width / 2;
    this.camera.position.y = ctx.canvas.height / 2;
    this.camera.dimensions.x = ctx.canvas.width;
    this.camera.dimensions.y = ctx.canvas.height;
  }
}

export class GameScene extends Scene {
  
  /**
   * @type {GameContext}
   */
  context;

  /**
   * 
   * @param {GameContext} contex 
   */
  constructor(contex) {
    super()
    this.context = contex;
  }

  resetGameState() {
    this.context.state = 'running'
    this.context.counter = 0;
    // @todo João, revisar e integrar esses códigos de reset
    for (const entity of this.context.entities) {
      entity.initialState();
    }
  }
}
