import { AppContext } from './app-context.js';
import { config } from './config.js';
import { loadLevel } from './entities.js';
import { GameContext, GameScene } from './game-scene.js';
import { MenuScene } from './menu-scene.js';
import { drawRect } from './render.js';
import { resourceManager } from './resource-manager.js';
import { SceneManager } from './scene-manager.js';

console.log('Olá mundo dos games de pássaros!');

const appElement = document.getElementById('app');

appElement.style.width = config.width + 'px';
appElement.style.height = config.height + 'px';


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


const context = new AppContext(new SceneManager(appElement, null));

context.sceneManager.setup()

context.changeTo(new MenuScene(context));

let lastTimestamp = 0;
requestAnimationFrame(function loop(timestamp) {
  
  if (lastTimestamp === 0) {
    lastTimestamp = timestamp;
    requestAnimationFrame(loop)  
    return;
  }

  const starTime = performance.now();

  context.sceneManager.changeIfNeeds()

  context.sceneManager.execute(timestamp)

  // @note também faz parte da renderização, mas por hora fica fora do método `Scene.render`
  const endTime = performance.now();
  // @ts-expect-error
  const memory = performance.memory;
  // @todo joão, talvez mover esse parâmetro pra fora desse objeto
  if (context.sceneManager.current && context.sceneManager.current instanceof GameScene && 
    context.sceneManager.current.gameContext.isShowMemory && memory) {
    const ctx = context.sceneManager.current.gameContext.ctx;
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

