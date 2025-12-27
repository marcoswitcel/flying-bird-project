import { BirdEntity, Entity } from './entities.js';
import { Scene } from './scene.js';

export class GameContext {
  /**
   * @type {Entity[]}
   */
  entities = [];
  bird = new BirdEntity();
  
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
}
