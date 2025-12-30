import { Camera } from './camera.js';
import { BirdEntity, Entity, exportedIdGenerator, PipeEntity, resetExportedIdSequence } from './entities.js';
import { Scene } from './scene.js';
import { vec2, Vector2 } from './vector2.js';

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
   * @type {Vector2 | null} 
   */
  mousedown = null;
  mouseMoved = false;

  /**
   * @type {CanvasRenderingContext2D}
   */
  ctx;

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  constructor(ctx) {
    this.ctx = ctx;
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

  setup() {
    document.addEventListener('mousedown', this.handleMousedown);
    
    document.addEventListener('mouseup', this.handleMouseup);

    document.addEventListener('mousedown', (event) => {
      this.context.mousedown = vec2(event.offsetX, event.offsetY);
      this.context.mouseMoved = false;
    
      const clickInWorldSpace = this.context.camera.position
        .copy()
        .add(this.context.mousedown.copy().subScalar(this.context.ctx.canvas.width / 2, this.context.ctx.canvas.height / 2));
      
      this.context.selectedEntity = null;
      for (const entity of this.context.entities) {
        if (entity.getVisibleRect().isInside(clickInWorldSpace)) {
          console.log(entity);
          this.context.selectedEntity = entity;
        }
      }
    });

    document.addEventListener('mousemove', this.handleMousemove);
    
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyP': {
          this.context.paused = !this.context.paused;
        }; break;
        case 'KeyS': {
          this.context.isRenderSprite = !this.context.isRenderSprite;
        }; break;
        case 'KeyM': {
          this.context.isShowMemory = !this.context.isShowMemory;
        }; break;
        case 'KeyR': {
          this.resetGameState();
        }; break;
        case 'KeyD': {
          this.context.isShowDimension = !this.context.isShowDimension;
        }; break;
        case 'KeyF': {
          this.context.freeCamera = !this.context.freeCamera;
        }; break;
        case 'KeyC': {
          this.context.selectedEntity = null;
        }; break;
        case 'KeyE': {
          let exported = ''; ;
          if (this.context.selectedEntity) {
            exported = this.context.selectedEntity.serialize();
          } else {
            resetExportedIdSequence();
            
            const world = {
              world: {
                entities: this.context.entities
                  .map(e => e.exportableObject())
                  .sort((a, b) => a.id - b.id)
                  .map(e => { e.id = exportedIdGenerator(); return e; })
              }
            };
            exported = JSON.stringify(world, null, 2);
          }
          navigator.clipboard.writeText(exported)
            .then(() => {
              console.log('Copiado: ' + exported);
            })
            .catch(() => {
              console.error('Problema ao copiar');
            });
        }; break;
        case 'KeyO': {
          this.context.isShowCollider = !this.context.isShowCollider;
        }; break;
      }
    });
  }

  /**
   * @private
   * @type {() => void}
   * @returns 
   */
  handleMousedown = () => {
    if (this.context.paused || this.context.freeCamera) return;
  
    if (!this.context.bird.hitted) {
      this.context.bird.velocity.y = -4;
    }
  }

  /**
   * @private
   * @param {MouseEvent} event 
   */
  handleMouseup = (event) => {
    if (this.context.freeCamera && !this.context.mouseMoved && !this.context.selectedEntity) {
      // @todo João, mover esse código
      const clickInWorldSpace = this.context.camera.position
        .copy()
        .add(this.context.mousedown.copy().subScalar(this.context.ctx.canvas.width / 2, this.context.ctx.canvas.height / 2));
      const pipe = new PipeEntity();
      pipe.position = clickInWorldSpace.copy();
      this.context.entities.push(pipe);
    }
  
    this.context.mousedown = null;
    this.context.mouseMoved = false;
  }

  /**
   * @private
   * @param {MouseEvent} event 
   */
  handleMousemove = (event) => {
    if (!this.context.mousedown || !this.context.freeCamera) return;
  
    const deltaMove = vec2(event.offsetX, event.offsetY)
      .sub(this.context.mousedown);
  
    this.context.mousedown = vec2(event.offsetX, event.offsetY);
    this.context.mouseMoved = true;
  
    if (this.context.selectedEntity) {
      this.context.selectedEntity.position.add(deltaMove);
    } else {
      this.context.camera.position.add(deltaMove.mulScalar(-1));
    }
  }
}
