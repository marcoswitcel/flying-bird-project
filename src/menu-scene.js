import { AppContext } from './app-context.js';
import { GameScene } from './game-scene.js';
import { Scene } from './scene.js';

export class MenuScene extends Scene {

  /**
   * 
   * @param {AppContext} appContext
   */
  constructor(appContext) {
    super(appContext, 'Menu');
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  setup(rootElement = null) {
    // @todo joão, temporário 
    rootElement.innerHTML = `
      <button type="button" id="jogar">Jogar</button>
    `

    rootElement.querySelector('#jogar').addEventListener('click', () => {
      this.appContext.changeTo(new GameScene(this.appContext));
    })
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  cleanUp(rootElement = null) {
    // @todo joão, refatorar o setup para não fazer o lick dos callbacks
    rootElement.innerHTML = null
  }
}
