import { Camera } from './camera.js';
import { BoundingRect, CollisionShape, drawRectBorder, RectCollisionShape } from './collision.js';
import { BirdEntity, Entity, TiledEntity, PipeEntity, processLevelData, RUNTIME_ID_SEQUENCE_START, exportedIdGenerator, ParallaxEntity } from './entities.js';
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

/**
 * @type {Entity[]}
 */
const entities = [];
let counter = 0;
const bird = new BirdEntity();
const parallax = new ParallaxEntity();


let paused = false;
let freeCamera = false;
let isShowCollider = false;
let isShowDimension = false;
let isRenderSprite = true;
let isShowMemory = false;

document.addEventListener('mousedown', () => {
  if (paused || freeCamera) return;

  if (!bird.hitted) {
    bird.velocity.y = -4;
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
  if (freeCamera && !mouseMoved && !selectedEntity) {
    // @todo João, mover esse código
    const clickInWorldSpace = camera.position
      .copy()
      .add(mousedown.copy().subScalar(canvas.width / 2, canvas.height / 2));
    const pipe = new PipeEntity();
    pipe.position = clickInWorldSpace.copy();
    entities.push(pipe);
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
  for (const entity of entities) {
    if (entity.getVisibleRect().isInside(clickInWorldSpace)) {
      console.log(entity);
      selectedEntity = entity;
    }
  }
});
document.addEventListener('mousemove', (event) => {
  if (!mousedown || !freeCamera) return;

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

const resetGameState = () => {
  counter = 0;
  // @todo João, revisar e integrar esses códigos de reset
  for (const entity of entities) {
    entity.initialState();
  }
};

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyP': {
      paused = !paused;
    }; break;
    case 'KeyS': {
      isRenderSprite = !isRenderSprite;
    }; break;
    case 'KeyM': {
      isShowMemory = !isShowMemory;
    }; break;
    case 'KeyR': {
      resetGameState();
    }; break;
    case 'KeyD': {
      isShowDimension = !isShowDimension;
    }; break;
    case 'KeyF': {
      freeCamera = !freeCamera;
    }; break;
    case 'KeyC': {
      selectedEntity = null;
    }; break;
    case 'KeyE': {
      let exported = ''; ;
      if (selectedEntity) {
        exported = selectedEntity.serialize();
      } else {
        const world = {
          world: {
            entities: entities
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
      isShowCollider = !isShowCollider;
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

  if (!paused)
  for (const entity of entities) {
    if (entity instanceof BirdEntity) {
      // gravidade
      entity.accel.y += 0.15;

      entity.velocity.add(entity.accel);
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
      if (!freeCamera) {
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

  for (const entity of entities) {
    if (entity.type === 'PipeEntity') {
      /** @type {PipeEntity} */
      // @ts-expect-error
      const pipe = entity;
      if (!pipe.birdPassedThrough && pipe.position.x < bird.position.x) {
        pipe.birdPassedThrough = true;
        counter++;
      }
    }
  }

  if (!paused)
  for (const entity of entities) {
    if (!(entity instanceof BirdEntity) && entity.collisionShape instanceof RectCollisionShape) {
      const rectEntity = new BoundingRect(entity.position, entity.collisionShape.dimensions);
      const rectBird = new BoundingRect(bird.position, bird.collisionShape.dimensions);

      if (rectBird.isIntersecting(rectEntity)) {
        entity.collisionShape.color = 'red';
        bird.gotHit();
      } else {
        entity.collisionShape.color = 'black';
      }
    }
  }

  // faze de renderização
  drawRect(ctx, 0, 0, canvas.width, canvas.height, 'blue');

  // contador
  drawText(ctx, `${counter}`, vec2(24, 24), 16, 'white', 'monospace');
  
  for (const entity of entities) {
    // @todo João, não funcionando para a TiledEntity
    // if (!entity.getVisibleRect().isIntersecting(camera)) continue;

    if (isRenderSprite) entity.render(ctx, camera);

    if (isShowDimension) {
      const dimensions = (entity.type === 'TiledEntity') ? { x: entity.sprite.width * entity.dimension.x, y: entity.sprite.height * entity.dimension.y, } : entity.dimension;
      drawRectBorder(ctx, camera, entity.position, dimensions, 'black', true);
    }

    if (isShowCollider && entity.collisionShape) {
      entity.collisionShape.render(ctx, camera, entity.position);
    }
  }

  if (bird.hitted) {
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
  if (isShowMemory && memory) {
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

fetch("../public/level/level01.json")
  .then(response => {
    return response.json();
  })
  .then(json => {
    // @todo joão, parallax ajustar
    entities.push(parallax);

    for (const entity of processLevelData(json)) {
      entities.push(entity);
    }
    // @note João, hack temporário para fazer o paássaro ser renderizado por último
    entities.push(bird);
  })
  .catch((reason) => {
    console.log(reason);
  })
