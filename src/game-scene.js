import { Camera } from './camera.js';
import { drawRectBorder } from './collision.js';
import { BirdEntity, Entity, exportedIdGenerator, PipeEntity, resetExportedIdSequence } from './entities.js';
import { drawRect, drawText } from './render.js';
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
    // @note listas sincronizadas @setup/cleanup
    document.addEventListener('mousedown', this.handleMousedown);
    document.addEventListener('mouseup', this.handleMouseup);
    document.addEventListener('mousemove', this.handleMousemove);
    document.addEventListener('keyup', this.handleKeyup);
  }

  cleanUp() {
    // @note listas sincronizadas @setup/cleanup
    document.removeEventListener('mousedown', this.handleMousedown);
    document.removeEventListener('mouseup', this.handleMouseup);
    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('keyup', this.handleKeyup);
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  render(ctx) {
    const canvas = ctx.canvas;

    // faze de renderização
    drawRect(ctx, 0, 0, canvas.width, canvas.height, 'blue');
  
    // contador
    drawText(ctx, `${this.context.counter}`, vec2(24, 24), 16, 'white', 'monospace');
    
    for (const entity of this.context.entities) {
      // @todo João, não funcionando para a TiledEntity
      // if (!entity.getVisibleRect().isIntersecting(camera)) continue;
  
      if (this.context.isRenderSprite) entity.render(ctx, this.context.camera);
  
      if (this.context.isShowDimension) {
        const dimensions = (entity.type === 'TiledEntity') ? { x: entity.sprite.width * entity.dimension.x, y: entity.sprite.height * entity.dimension.y, } : entity.dimension;
        drawRectBorder(ctx, this.context.camera, entity.position, dimensions, 'black', true);
      }
  
      if (this.context.isShowCollider && entity.collisionShape) {
        entity.collisionShape.render(ctx, this.context.camera, entity.position);
      }
    }
  
    if (this.context.bird.hitted) {
      const boxWidth = 200, boxHeight = 75;
      const x = ctx.canvas.width / 2 - boxWidth / 2;
      const y = ctx.canvas.height / 2 - boxHeight / 2;
      drawRect(ctx, 0, 0, canvas.width, canvas.height, 'rgba(0, 0, 0, .5)');
      drawRect(ctx, x, y, boxWidth, boxHeight, 'green');
      drawText(ctx, 'Fim de jogo', vec2(ctx.canvas.width / 2, ctx.canvas.height / 2), 24, 'white', 'monospace');
    }
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  handleMousedown = (event) => {
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

  /**
   * @private
   * @param {KeyboardEvent} event 
   */
  handleKeyup = (event) => {
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
  }
}
