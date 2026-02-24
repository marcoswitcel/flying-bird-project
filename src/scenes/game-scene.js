import { AppContext } from '../app-context.js';
import { Camera } from '../camera.js';
import { BoundingRect, drawRectBorder, RectCollisionShape } from '../collision.js';
import { config } from '../config.js';
import { BirdEntity, Entity, EntityManager, exportedIdGenerator, generateSceneWithManyElements, loadLevel, ParallaxEntity, PipeEntity, resetExportedIdSequence } from '../entities.js';
import { NextLevelScene } from './next-level-scene.js';
import { TimerProfile } from '../profiling.js';
import { drawRect, drawText } from '../render.js';
import { Scene } from './scene.js';
import { AnimatedSprite, TimeManager } from '../sprite.js';
import { vec2, Vector2 } from '../vector2.js';
import { SpatialGrid } from '../spatial-grid.js';

export class GameContext {
  /**
   * @type {EntityManager}
   */
  entityManager = new EntityManager();
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
   * @type {SpatialGrid}
   */
  spatialGrid;
  
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
    this.spatialGrid = new SpatialGrid(300);
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
    for (const entity of this.gameContext.entityManager.allEntities) {
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

    // @todo João, testar com valores diversos de cellSize e fazer testes com update versus add limpo
    // @todo João, quando tiver o método range testar as conclusões do loop de render contra os palpites do grid
    // const grid = new SpatialGrid(100);

    /**
     * @todo João, talvez criar um set de entidades visíveis ou atualizáveis aqui?
     * seriam apenas as que a câmera vê que atualizariam?
     */
    for (const entity of this.gameContext.entityManager.all.BirdEntity) {
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

      // update no grid
      this.gameContext.spatialGrid.update(entity);
    }

    for (const entity of this.gameContext.entityManager.all.ParallaxEntity) {
      // @todo João, duplicado no render do método e aqui...
      // mantendo a área visível alinhada com a renderização em relação a câmera câmera
      entity.position.x = this.gameContext.camera.position.x;

      // update no grid
      this.gameContext.spatialGrid.update(entity);
    }

    /**
     * @todo joão, um set só de pipes que estão perto do pássaro?
     */
    for (const pipe of this.gameContext.entityManager.all.PipeEntity) {
      if (!pipe.birdPassedThrough && pipe.position.x < this.gameContext.bird.position.x) {
        pipe.birdPassedThrough = true;
        this.gameContext.counter++;
        if (pipe.isClearLevel) {
          this.gameContext.state = 'win';
        }
      }
    }

    for (const entity of this.gameContext.entityManager.allEntities) {
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
    /**
     * @todo João, remover quando acabar de testar
     * @type {Entity[]}
     */
    const all = []
    /**
     * @todo João, aqui usar alguma estrutura para fazer o "particionamento espacial" e checar só áreas próximas
     * da câmera, assim evitando percorrer as possíveis 10.000 entidades.
     */
    for (const entity of this.gameContext.entityManager.allEntities) {
      // @note João, fiz um teste e melhorou bastante com o "if" abaixo, movi o código para o método "isVisible"
      // no caso de 10_000 entidades, com esse if a perfomance melhora "16x", mas o ideal mesmo é não percorrer o set inteiro
      if (!entity.isVisible(this.gameContext.camera)) continue;
      
      // visible
      all.push(entity);
  
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


    // @todo João, remover, testei usar o resultado da query no if acima, melhorou a perfomance
    const all2 = this.gameContext.spatialGrid.query(this.gameContext.camera.position.x, this.gameContext.camera.position.y, this.gameContext.camera.dimensions.x, this.gameContext.camera.dimensions.y);
    for (const entity of all2) {
      if (!entity.isVisible(this.gameContext.camera)) all2.delete(entity)
    }
    console.assert(all.length ===  all2.size, 'Deveria ser do mesmo tamanho. %s %s', all.length, all2.size);
  
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
      drawRect(ctx, 0, 0, 300, 105, 'rgba(0, 0, 0, .75)');
      ctx.fillStyle = 'white';
      ctx.font = '24px serif';
      ctx.textAlign = 'left';
      ctx.fillText('JS Heap: ' + memory.usedJSHeapSize, 25, 25);
      ctx.fillText('JS Heap Total: ' + memory.totalJSHeapSize, 25, 45);
      ctx.fillText('Time: ' + (endTime - this.starTime).toFixed(4), 25, 65);
      ctx.fillText('Entities: ' + this.gameContext.entityManager.allEntities.length, 25, 85);
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
    for (const entity of this.gameContext.entityManager.allEntities) {
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
      this.gameContext.entityManager.add(pipe);
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
              entities: this.gameContext.entityManager.allEntities
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
      case 'KeyG': {
        // @todo João implementar o comando
        generateSceneWithManyElements(this.gameContext);
      }; break;
    }
  }
}
