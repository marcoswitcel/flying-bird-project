import { Camera } from './camera.js';
import { BoundingRect, CollisionShape, drawRectBorder, RectCollisionShape } from './collision.js';
import { BirdEntity, Entity, TiledEntity, PipeEntity, processLevelData, RUNTIME_ID_SEQUENCE_START, exportedIdGenerator, ParallaxEntity, resetExportedIdSequence } from './entities.js';
import { GameContext, GameScene } from './game-scene.js';
import { drawRect, drawRectStroke, drawText } from './render.js';
import { resourceManager } from './resource-manager.js';
import { AnimatedSprite, Sprite } from './sprite.js';
import { vec2, Vector2 } from './vector2.js';

console.log('Olá mundo dos games de pássaros!');

const canvas = document.createElement('canvas');

canvas.width = 400;
canvas.height = 520;

document.body.append(canvas);

const ctx = canvas.getContext('2d');

resourceManager.add('./assets/image/pipe/pipe.svg', 'image','pipe');
resourceManager.add('./assets/image/pipe/upside-down-pipe.svg', 'image','upside-down-pipe');
resourceManager.add('./assets/image/bird/idle/frame-1.png', 'image','bird');
resourceManager.add('./assets/image/bird/idle/frame-1.png', 'image','bird.1');
resourceManager.add('./assets/image/bird/idle/frame-2.png', 'image','bird.2');
resourceManager.add('./assets/image/bird/idle/frame-3.png', 'image','bird.3');
resourceManager.add('./assets/image/bird/idle/frame-4.png', 'image','bird.4');
resourceManager.add('./assets/image/bird/got-hit/frame-1.png', 'image','bird.hit');
resourceManager.add('./assets/image/floor/floor.svg', 'image','floor');
// parallax
resourceManager.add('./assets/image/parallax/moutains.svg', 'image','moutains');
resourceManager.add('./assets/image/parallax/clouds.svg', 'image','clouds');


const camera = new Camera();
camera.position.x = ctx.canvas.width / 2;
camera.position.y = ctx.canvas.height / 2;
camera.dimensions.x = ctx.canvas.width;
camera.dimensions.y = ctx.canvas.height;


const gameContext = new GameContext();
const gameScene = new GameScene(gameContext);

document.addEventListener('mousedown', () => {
  if (gameContext.paused || gameContext.freeCamera) return;

  if (!gameContext.bird.hitted) {
    gameContext.bird.velocity.y = -4;
  }
});

/**
 * @type {Vector2 | null} 
 */
let mousedown = null;
let mouseMoved = false;
/**
 * @type {Entity|null}
 */
let selectedEntity = null;
document.addEventListener('mouseup', (event) => {
  if (gameContext.freeCamera && !mouseMoved && !selectedEntity) {
    // @todo João, mover esse código
    const clickInWorldSpace = camera.position
      .copy()
      .add(mousedown.copy().subScalar(canvas.width / 2, canvas.height / 2));
    const pipe = new PipeEntity();
    pipe.position = clickInWorldSpace.copy();
    gameContext.entities.push(pipe);
  }

  mousedown = null;
  mouseMoved = false;
});
document.addEventListener('mousedown', (event) => {
  mousedown = vec2(event.offsetX, event.offsetY);
  mouseMoved = false;

  const clickInWorldSpace = camera.position
    .copy()
    .add(mousedown.copy().subScalar(canvas.width / 2, canvas.height / 2));
  
  selectedEntity = null;
  for (const entity of gameContext.entities) {
    if (entity.getVisibleRect().isInside(clickInWorldSpace)) {
      console.log(entity);
      selectedEntity = entity;
    }
  }
});
document.addEventListener('mousemove', (event) => {
  if (!mousedown || !gameContext.freeCamera) return;

  const deltaMove = vec2(event.offsetX, event.offsetY)
    .sub(mousedown);

  mousedown = vec2(event.offsetX, event.offsetY);
  mouseMoved = true;

  if (selectedEntity) {
    selectedEntity.position.add(deltaMove);
  } else {
    camera.position.add(deltaMove.mulScalar(-1));
  }
});



document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyP': {
      gameContext.paused = !gameContext.paused;
    }; break;
    case 'KeyS': {
      gameContext.isRenderSprite = !gameContext.isRenderSprite;
    }; break;
    case 'KeyM': {
      gameContext.isShowMemory = !gameContext.isShowMemory;
    }; break;
    case 'KeyR': {
      gameScene.resetGameState();
    }; break;
    case 'KeyD': {
      gameContext.isShowDimension = !gameContext.isShowDimension;
    }; break;
    case 'KeyF': {
      gameContext.freeCamera = !gameContext.freeCamera;
    }; break;
    case 'KeyC': {
      selectedEntity = null;
    }; break;
    case 'KeyE': {
      let exported = ''; ;
      if (selectedEntity) {
        exported = selectedEntity.serialize();
      } else {
        resetExportedIdSequence();
        
        const world = {
          world: {
            entities: gameContext.entities
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
      gameContext.isShowCollider = !gameContext.isShowCollider;
    }; break;
  }
});


let lastTimestamp = 0;
requestAnimationFrame(function loop(timestamp) {
  if (lastTimestamp === 0)
  {
    lastTimestamp = timestamp;
    requestAnimationFrame(loop)  
    return;
  }

  const starTime = performance.now();

  if (!gameContext.paused)
  for (const entity of gameContext.entities) {
    if (entity instanceof BirdEntity) {
      // gravidade
      entity.accel.y += 0.15;

      entity.velocity.add(entity.accel);

      if (gameContext.state === 'win') {
        entity.velocity.y = 0
        loadLevel(gameContext, "../public/level/level02.json")
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
      if (!gameContext.freeCamera) {
        camera.position.x = entity.position.x + 100;
      }

      // pequeno feedback visual para demonstrar o esforço do pássaro tentando subir
      if (entity.sprite instanceof AnimatedSprite) {
        if (entity.velocity.y < 0) {
          entity.sprite.length = 150;
        } else {
          entity.sprite.length = 250;
        }
      }
    }
  }

  for (const entity of gameContext.entities) {
    if (entity.type === 'PipeEntity') {
      /** @type {PipeEntity} */
      // @ts-expect-error
      const pipe = entity;
      if (!pipe.birdPassedThrough && pipe.position.x < gameContext.bird.position.x) {
        pipe.birdPassedThrough = true;
        gameContext.counter++;
        if (pipe.isClearLevel) {
          gameContext.state = 'win';
        }
      }
    }
  }

  if (!gameContext.paused)
  for (const entity of gameContext.entities) {
    if (!(entity instanceof BirdEntity) && entity.collisionShape instanceof RectCollisionShape) {
      const rectEntity = new BoundingRect(entity.position, entity.collisionShape.dimensions);
      const rectBird = new BoundingRect(gameContext.bird.position, gameContext.bird.collisionShape.dimensions);

      if (rectBird.isIntersecting(rectEntity)) {
        entity.collisionShape.color = 'red';
        gameContext.bird.gotHit();
      } else {
        entity.collisionShape.color = 'black';
      }
    }
  }

  // faze de renderização
  drawRect(ctx, 0, 0, canvas.width, canvas.height, 'blue');

  // contador
  drawText(ctx, `${gameContext.counter}`, vec2(24, 24), 16, 'white', 'monospace');
  
  for (const entity of gameContext.entities) {
    // @todo João, não funcionando para a TiledEntity
    // if (!entity.getVisibleRect().isIntersecting(camera)) continue;

    if (gameContext.isRenderSprite) entity.render(ctx, camera);

    if (gameContext.isShowDimension) {
      const dimensions = (entity.type === 'TiledEntity') ? { x: entity.sprite.width * entity.dimension.x, y: entity.sprite.height * entity.dimension.y, } : entity.dimension;
      drawRectBorder(ctx, camera, entity.position, dimensions, 'black', true);
    }

    if (gameContext.isShowCollider && entity.collisionShape) {
      entity.collisionShape.render(ctx, camera, entity.position);
    }
  }

  if (gameContext.bird.hitted) {
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
  if (gameContext.isShowMemory && memory) {
    drawRect(ctx, 0, 0, 300, 85, 'rgba(0, 0, 0, .75)');
    ctx.fillStyle = 'white';
    ctx.font = '24px serif';
    ctx.textAlign = 'left';
    ctx.fillText('JS Heap: ' + memory.usedJSHeapSize, 25, 25);
    ctx.fillText('JS Heap Total: ' + memory.totalJSHeapSize, 25, 45);
    ctx.fillText('Time: ' + (endTime - starTime).toFixed(4), 25, 65);
  }

  requestAnimationFrame(loop)
});

/**
 * 
 * @param {GameContext} gameContext 
 * @param {string} levelFile 
 */
function loadLevel(gameContext, levelFile) {
  fetch(levelFile)
    .then(response => {
      return response.json();
    })
    .then(json => {
      // reset
      gameContext.entities.length = 0;
      gameScene.resetGameState();

      const allEntitiesImported = processLevelData(json)

      // @note João, hack temporário para fazer o parallax renderizar por trás da cena
      for (const entity of allEntitiesImported) if (entity instanceof ParallaxEntity) {
        gameContext.entities.push(entity);
      }
      
      for (const entity of allEntitiesImported) if (!(entity instanceof ParallaxEntity)) {
        gameContext.entities.push(entity);
      }
      // @note João, hack temporário para fazer o paássaro ser renderizado por último
      gameContext.entities.push(gameContext.bird);
      gameContext.bird.initialState()
      
    })
    .catch((reason) => {
      console.log(reason);
    })
}

loadLevel(gameContext, "../public/level/level01.json")
