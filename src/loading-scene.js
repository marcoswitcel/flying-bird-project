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
  padding: 1rem;
  box-sizing: border-box;
  justify-content: center;
  background-color: white;
}

.loader {
  width: 100%;
  height: 1.5rem;
  background-color: blue;
  transition: .5s linear;
  transform = scaleX(0);
  border-radius: 3px;
}
`

const html = `
<div class="container">
  <div class="loader"></div>  
</div>
`


export class LoadingScene extends Scene {


  /**
   * Tempo mínimo com a tela aberta
   * @type {number}
   */
  minimalTimeInScene = 1.8 * 1000;

  /**
   * @type {HTMLElement|null}
   */
  loaderElement = null;

  /** 
   * @type {number}
   */
  firstRenderTimestamp = 0;

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
    // registra quando tela foi montada, como não tem timestamp no setup faço aqui
    if (this.firstRenderTimestamp === 0) {
      this.firstRenderTimestamp = timestamp;
    }

    // @note pode ser bem lento isso aqui... muito trabalho duplicado
    const percentage = this.appContext.resourceManager.numberOfResourcesLoaded() / this.appContext.resourceManager.numberOfResources();

    this.loaderElement.style.transform = `scaleX(${percentage})`

    // @todo João, testar e melhorar essa tela de loading...
    if (resourceManager.isAllLoaded()) {
      if (timestamp - this.firstRenderTimestamp > this.minimalTimeInScene) {
        this.appContext.changeTo(new MenuScene(this.appContext));
      }
    }
  }
}
