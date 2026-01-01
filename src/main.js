import { loadLevel } from './entities.js';
import { GameContext, GameScene } from './game-scene.js';
import { drawRect } from './render.js';
import { resourceManager } from './resource-manager.js';

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


const gameContext = new GameContext(ctx);
const gameScene = new GameScene(gameContext);

const sceneManager = {
  current: null,
  entering: gameScene,
}

let lastTimestamp = 0;
requestAnimationFrame(function loop(timestamp) {
  if (lastTimestamp === 0)
  {
    lastTimestamp = timestamp;
    requestAnimationFrame(loop)  
    return;
  }

  // roda cleanUp e setup fazendo assim o swap da cena
  if (sceneManager.entering) {
    if (sceneManager.current) {
      console.log('[SceneManager] cleanUp: ' + sceneManager.current.constructor.name)
      sceneManager.current.cleanUp();
    }
    
    sceneManager.current = sceneManager.entering;
    sceneManager.entering = null;

    console.log('[SceneManager] setup: ' + sceneManager.current.constructor.name)
    sceneManager.current.setup();
  }

  const starTime = performance.now();


  gameScene.update(timestamp);

  gameScene.render(ctx);

  // @note também faz parte da renderização, mas por hora fica fora do método `Scene.render`
  const endTime = performance.now();
  // @ts-expect-error
  const memory = performance.memory;
  if (gameScene.context.isShowMemory && memory) {
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

loadLevel(gameScene, "../public/level/level01.json")
