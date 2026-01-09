import { AppContext } from './app-context.js';
import { GameScene } from './game-scene.js';
import { LevelSelectionScene } from './level-selection-scene.js';
import { MenuScene } from './menu-scene.js';
import { resourceManager } from './resource-manager.js';
import { Scene } from './scene.js';

const style = `
.container {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  background-color: white;
  padding: 1rem;
  box-sizing: border-box;
  justify-content: center;
  background-color: black;
}

.loader {
  width: 100%;
  height: 16px;
  background-color: white
}
`

const html = `
<div class="container">
  <div class="loader"></div>  
</div>
`


export class LoadingScene extends Scene {


  /**
   * @type {HTMLElement|null}
   */
  loaderElement = null;

  /**
   * 
   * @param {AppContext} appContext
   */
  constructor(appContext) {
    super(appContext, 'Carregando...');
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  setup(rootElement = null) {
    // @todo joão, temporário 
    rootElement.innerHTML = html

    this.loaderElement = rootElement.querySelector('.loader');

    this.appContext.sceneManager.updateStyle(style);

    // @todo João, update faltando
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  cleanUp(rootElement = null) {
    // @todo joão, refatorar o setup para não fazer o lick dos callbacks
    rootElement.innerHTML = null

    this.appContext.sceneManager.updateStyle('');
  }

  update(timestamp) {
    // @note pode ser bem lento isso aqui... muito trabalho duplicado

    // @todo João, testar e melhorar essa tela de loading...
    if (resourceManager.isAllLoaded()) {
      this.appContext.changeTo(new MenuScene(this.appContext));
      return;
    }

    const percentage = this.appContext.resourceManager.numberOfResourcesLoaded() / this.appContext.resourceManager.numberOfResources();

    this.loaderElement.style.transform = `scaleX(${percentage})`

  }
}
