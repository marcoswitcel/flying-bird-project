import { AppContext } from './app-context.js';
import { config } from './config.js';
import { LoadingScene } from './scenes/loading-scene.js';
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
resourceManager.add('./assets/image/floor/grass-1.svg', 'image','grass.1');
resourceManager.add('./assets/image/floor/grass-2.svg', 'image','grass.2');
// parallax
resourceManager.add('./assets/image/parallax/mountains.svg', 'image','mountains');
resourceManager.add('./assets/image/parallax/clouds.svg', 'image','clouds');

// level metadados
resourceManager.add('./level/campaign.json', 'json','campaign');


const context = new AppContext(new SceneManager(appElement, null));

context.sceneManager.setup()

context.changeTo(new LoadingScene(context));

let lastTimestamp = 0;
requestAnimationFrame(function loop(timestamp) {
  
  if (lastTimestamp === 0) {
    lastTimestamp = timestamp;
    requestAnimationFrame(loop)  
    return;
  }

  context.sceneManager.changeIfNeeds()

  context.sceneManager.execute(timestamp)

  requestAnimationFrame(loop)
});

