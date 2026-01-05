import { AppContext } from './app-context.js';
import { GameScene } from './game-scene.js';
import { MenuScene } from './menu-scene.js';
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
}

.button {
  padding: 1rem;
  font-size: 1rem;
  border: none;
  outline: none;
  flex-grow: initial;
  cursor: pointer;
  margin: 1rem;
  margin: 0.5em 0;
  border-radius: 3px;
  letter-spacing: 0.2em;
}

.button:hover {
  background-color: rgba(0,0,0,.1)
}

.button:active {
  background-color: rgba(0,0,0,.2)
}
`

const html = `
<div class="container">
  <button class="button" type="button" id="btnNextLevel">Primeiro Nível</button>
  <button class="button" type="button" id="btnMenu">Menu</button>
</div>
`

export class LevelSelectionScene extends Scene {

  /**
   * 
   * @param {AppContext} appContext
   */
  constructor(appContext) {
    super(appContext, 'Seleção de Nível');
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  setup(rootElement = null) {
    // @todo joão, temporário 
    rootElement.innerHTML = html

    this.appContext.sceneManager.updateStyle(style);

    rootElement.querySelector('#btnNextLevel').addEventListener('click', () => {
      // @todo João, aqui não deve ser fixo
      this.appContext.changeTo(new GameScene(this.appContext, '../public/level/level01.json'));
    })

    rootElement.querySelector('#btnMenu').addEventListener('click', () => {
      this.appContext.changeTo(new MenuScene(this.appContext));
    })
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  cleanUp(rootElement = null) {
    // @todo joão, refatorar o setup para não fazer o lick dos callbacks
    rootElement.innerHTML = null

    this.appContext.sceneManager.updateStyle('');
  }
}
