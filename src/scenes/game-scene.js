import { AppContext } from '../app-context.js';
import { Camera } from '../camera.js';
import { BoundingRect, drawRectBorder, RectCollisionShape } from '../collision.js';
import { config } from '../config.js';
import { BirdEntity, Entity, exportedIdGenerator, loadLevel, ParallaxEntity, PipeEntity, resetExportedIdSequence } from '../entities.js';
import { NextLevelScene } from './next-level-scene.js';
import { TimerProfile } from '../profiling.js';
import { drawRect, drawText } from '../render.js';
import { Scene } from './scene.js';
import { AnimatedSprite, TimeManager } from '../sprite.js';
import { vec2, Vector2 } from '../vector2.js';

export class GameContext {
  /**
   * @type {Entity[]}
   */
  entities = [];
  /**
   * @type {string}
   */
  backgroundColor = 'blue';
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
  gameContext;

  /**
   * @type {string}
   */
  levelPath;

  /**
   * usado apenas para os cálculos de tempo de execução
   * @private
   * @type {number}
   */
  starTime = 0;

  /**
   * 
   * @param {AppContext} appContext
   * @param {string} levelPath
   */
  constructor(appContext, levelPath) {
    super(appContext, 'Jogando');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = config.width;
    canvas.height = config.height;

    this.gameContext = new GameContext(ctx);
    this.levelPath = levelPath;
  }

  resetGameState() {
    this.gameContext.state = 'running'
    this.gameContext.counter = 0;
    // @todo João, revisar e integrar esses códigos de reset
    for (const entity of this.gameContext.entities) {
      entity.initialState();
    }
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  setup(rootElement = null) {
    // @note listas sincronizadas @setup/cleanup
    document.addEventListener('mousedown', this.handleMousedown);
    document.addEventListener('mouseup', this.handleMouseup);
    document.addEventListener('mousemove', this.handleMousemove);
    document.addEventListener('keyup', this.handleKeyup);
    
    // adiciona no elemento #app
    rootElement.append(this.gameContext.ctx.canvas)

    loadLevel(this, this.levelPath);
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  cleanUp(rootElement = null) {
    // @note listas sincronizadas @setup/cleanup
    document.removeEventListener('mousedown', this.handleMousedown);
    document.removeEventListener('mouseup', this.handleMouseup);
    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('keyup', this.handleKeyup);

    // removendo canvas do #app
    rootElement.removeChild(this.gameContext.ctx.canvas)
  }

  update(timestamp) {
    // timing
    this.starTime = performance.now();
    
    if (this.gameContext.paused) { 
      TimeManager.stoped()
      return;
    }

    TimeManager.update(timestamp);

    for (const entity of this.gameContext.entities) {
      if (entity instanceof BirdEntity) {
        // gravidade
        entity.accel.y += 0.15;

        entity.velocity.add(entity.accel);

        if (this.gameContext.state === 'win') {
          entity.velocity.y = 0
          this.appContext.changeTo(new NextLevelScene(this.appContext, this.levelPath))
        }

        // por hora velocidade horizontal fixa
        if (!entity.hitted) {
          entity.velocity.x = 1.2;
        } else {
          entity.velocity.x = 0;
        }
        entity.position.add(entity.velocity);

        // reset aceleração
        entity.accel.x = 0;
        entity.accel.y = 0;

        // camera seguindo 'bird'
        if (!this.gameContext.freeCamera) {
          this.gameContext.camera.position.x = entity.position.x + 100;
        }

        // pequeno feedback visual para demonstrar o esforço do pássaro tentando subir
        if (entity.sprite instanceof AnimatedSprite) {
          if (entity.velocity.y < 0) {
            entity.sprite.length = 150;
          } else {
            entity.sprite.length = 250;
          }
        }
      } else if (entity instanceof ParallaxEntity) {
        // @todo João, duplicado no render do método e aqui...
        // mantendo a área visível alinhada com a renderização em relação a câmera câmera
        entity.position.x = this.gameContext.camera.position.x;
      }
    }

    for (const entity of this.gameContext.entities) {
      if (entity.type === 'PipeEntity') {
        /** @type {PipeEntity} */
        // @ts-expect-error
        const pipe = entity;
        if (!pipe.birdPassedThrough && pipe.position.x < this.gameContext.bird.position.x) {
          pipe.birdPassedThrough = true;
          this.gameContext.counter++;
          if (pipe.isClearLevel) {
            this.gameContext.state = 'win';
          }
        }
      }
    }

    for (const entity of this.gameContext.entities) {
      if (!(entity instanceof BirdEntity) && entity.collisionShape instanceof RectCollisionShape) {
        const rectEntity = new BoundingRect(entity.position, entity.collisionShape.dimensions);
        const rectBird = new BoundingRect(this.gameContext.bird.position, this.gameContext.bird.collisionShape.dimensions);

        if (rectBird.isIntersecting(rectEntity)) {
          entity.collisionShape.color = 'red';
          this.gameContext.bird.gotHit();
        } else {
          entity.collisionShape.color = 'black';
        }
      }
    }
  }

  render() {
    const ctx = this.gameContext.ctx;
    const canvas = ctx.canvas;

    // limpa e define a cor de fundo do mundo
    drawRect(ctx, 0, 0, canvas.width, canvas.height, this.gameContext.backgroundColor);
  
    // contador
    drawText(ctx, `${this.gameContext.counter}`, vec2(24, 24), 18, 'white', 'monospace');
    
    const timer = new TimerProfile();
    for (const entity of this.gameContext.entities) {
      // @todo João, o fundo se move e aí resetando o nível ocorre que às vezes ele fica fora da área da câmera
      // if (!entity.getVisibleRect().isIntersecting(this.gameContext.camera)) continue;
  
      if (this.gameContext.isRenderSprite) {
        if (entity.sprite instanceof AnimatedSprite) entity.sprite.updateIfNotPaused(TimeManager.deltaTime);

        entity.render(ctx, this.gameContext.camera);
      }
  
      if (this.gameContext.isShowDimension) {
        const dimensions = (entity.type === 'TiledEntity') ? { x: entity.sprite.width * entity.dimension.x, y: entity.sprite.height * entity.dimension.y, } : entity.dimension;
        drawRectBorder(ctx, this.gameContext.camera, entity.position, dimensions, 'black', true);
      }
  
      if (this.gameContext.isShowCollider && entity.collisionShape) {
        entity.collisionShape.render(ctx, this.gameContext.camera, entity.position);
      }
    }
  
    if (this.gameContext.bird.hitted) {
      const boxWidth = 200, boxHeight = 75;
      const x = ctx.canvas.width / 2 - boxWidth / 2;
      const y = ctx.canvas.height / 2 - boxHeight / 2;
      drawRect(ctx, 0, 0, canvas.width, canvas.height, 'rgba(0, 0, 0, .5)');
      drawRect(ctx, x, y, boxWidth, boxHeight, 'green');
      drawText(ctx, 'Fim de jogo', vec2(ctx.canvas.width / 2, ctx.canvas.height / 2), 24, 'white', 'monospace');
    }

    const endTime = performance.now();
    // @ts-expect-error
    const memory = performance.memory;
    
    if (this.gameContext.isShowMemory && memory) {
      const ctx = this.gameContext.ctx;
      drawRect(ctx, 0, 0, 300, 85, 'rgba(0, 0, 0, .75)');
      ctx.fillStyle = 'white';
      ctx.font = '24px serif';
      ctx.textAlign = 'left';
      ctx.fillText('JS Heap: ' + memory.usedJSHeapSize, 25, 25);
      ctx.fillText('JS Heap Total: ' + memory.totalJSHeapSize, 25, 45);
      ctx.fillText('Time: ' + (endTime - this.starTime).toFixed(4), 25, 65);
    }
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  handleMousedown = (event) => {
    this.gameContext.mousedown = vec2(event.offsetX, event.offsetY);
    this.gameContext.mouseMoved = false;
  
    const clickInWorldSpace = this.gameContext.camera.position
      .copy()
      .add(this.gameContext.mousedown.copy().subScalar(this.gameContext.ctx.canvas.width / 2, this.gameContext.ctx.canvas.height / 2));
    
    this.gameContext.selectedEntity = null;
    for (const entity of this.gameContext.entities) {
      if (entity.getVisibleRect().isInside(clickInWorldSpace)) {
        console.log(entity);
        this.gameContext.selectedEntity = entity;
      }
    }


    if (this.gameContext.paused || this.gameContext.freeCamera) return;
  
    if (!this.gameContext.bird.hitted) {
      this.gameContext.bird.velocity.y = -4;
    }
  }

  /**
   * @private
   * @param {MouseEvent} event 
   */
  handleMouseup = (event) => {
    if (this.gameContext.freeCamera && !this.gameContext.mouseMoved && !this.gameContext.selectedEntity) {
      // @todo João, mover esse código
      const clickInWorldSpace = this.gameContext.camera.position
        .copy()
        .add(this.gameContext.mousedown.copy().subScalar(this.gameContext.ctx.canvas.width / 2, this.gameContext.ctx.canvas.height / 2));
      const pipe = new PipeEntity();
      pipe.position = clickInWorldSpace.copy();
      this.gameContext.entities.push(pipe);
    }
  
    this.gameContext.mousedown = null;
    this.gameContext.mouseMoved = false;
  }

  /**
   * @private
   * @param {MouseEvent} event 
   */
  handleMousemove = (event) => {
    if (!this.gameContext.mousedown || !this.gameContext.freeCamera) return;
  
    const deltaMove = vec2(event.offsetX, event.offsetY)
      .sub(this.gameContext.mousedown);
  
    this.gameContext.mousedown = vec2(event.offsetX, event.offsetY);
    this.gameContext.mouseMoved = true;
  
    if (this.gameContext.selectedEntity) {
      this.gameContext.selectedEntity.position.add(deltaMove);
    } else {
      this.gameContext.camera.position.add(deltaMove.mulScalar(-1));
    }
  }

  /**
   * @private
   * @param {KeyboardEvent} event 
   */
  handleKeyup = (event) => {
    switch (event.code) {
      case 'KeyP': {
        this.gameContext.paused = !this.gameContext.paused;
      }; break;
      case 'KeyS': {
        this.gameContext.isRenderSprite = !this.gameContext.isRenderSprite;
      }; break;
      case 'KeyM': {
        this.gameContext.isShowMemory = !this.gameContext.isShowMemory;
      }; break;
      case 'KeyR': {
        this.resetGameState();
      }; break;
      case 'KeyD': {
        this.gameContext.isShowDimension = !this.gameContext.isShowDimension;
      }; break;
      case 'KeyF': {
        this.gameContext.freeCamera = !this.gameContext.freeCamera;
      }; break;
      case 'KeyC': {
        this.gameContext.selectedEntity = null;
      }; break;
      case 'KeyU': {
        if (this.gameContext.selectedEntity && this.gameContext.selectedEntity instanceof PipeEntity) {
          this.gameContext.selectedEntity.isUpsideDown = !this.gameContext.selectedEntity.isUpsideDown
          this.gameContext.selectedEntity.updateSprite()
        }
      }; break;
      case 'KeyH': {
        if (event.shiftKey && this.gameContext.selectedEntity instanceof PipeEntity) {
          const increateSize = 1.05;
          const pipe = this.gameContext.selectedEntity;
          pipe.collisionShape.dimensions.x *= increateSize;
          pipe.dimension.x *= increateSize;
        }
      }; break;
      case 'KeyV': {
        if (event.shiftKey && this.gameContext.selectedEntity instanceof PipeEntity) {
          const increateSize = 1.05;
          const pipe = this.gameContext.selectedEntity;
          pipe.collisionShape.dimensions.y *= increateSize;
          pipe.dimension.y *= increateSize;
        }
      }; break;
      case 'KeyE': {
        let exported = ''; ;
        if (this.gameContext.selectedEntity) {
          exported = this.gameContext.selectedEntity.serialize();
        } else {
          resetExportedIdSequence();
          
          const world = {
            backgroundColor: this.gameContext.backgroundColor,
            world: {
              entities: this.gameContext.entities
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
        this.gameContext.isShowCollider = !this.gameContext.isShowCollider;
      }; break;
    }
  }
}
