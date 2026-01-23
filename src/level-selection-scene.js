import { AppContext } from './app-context.js';
import { is } from './entities.js';
import { GameScene } from './scenes/game-scene.js';
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
  <div id="levels-wrapper" class="wrapper"></div>
  <button class="button" type="button" id="btnMenu">Menu</button>
</div>
`

export class LevelSelectionScene extends Scene {

  activated = false;

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
    this.activated = true;
    // @todo joão, temporário 
    rootElement.innerHTML = html

    this.appContext.sceneManager.updateStyle(style);

    rootElement.querySelector('#btnMenu').addEventListener('click', () => {
      this.appContext.changeTo(new MenuScene(this.appContext));
    })

    /**
     * @type {ApplicationTypes.CampaignJson}
     */
    const campaign = this.appContext.resourceManager.getJson('campaign')

    if (this.activated) {
      const wrapperElement = rootElement.querySelector('#levels-wrapper');
      
      if (is('object', campaign) && Array.isArray(campaign.worlds)) {
        const innerHTML = campaign.worlds.map(world => {
          return world.levels.map(level => `
            <button class="button level-select" type="button" data-path="../public/level/${world.name}/${level}.json">${level}</button>
          `).join('')
        })
        .join('')

        wrapperElement.innerHTML = innerHTML;
        wrapperElement.querySelectorAll('.button.level-select').forEach((element) => {
          element.addEventListener('click', () => {
            /**
             * @type {HTMLElement}
             * 
             */// @ts-expect-error
            const el = element;
            this.appContext.changeTo(new GameScene(this.appContext, el.dataset.path));
          })
        })
      }

    }
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  cleanUp(rootElement = null) {
    // @todo joão, refatorar o setup para não fazer o lick dos callbacks
    rootElement.innerHTML = null

    this.appContext.sceneManager.updateStyle('');
    this.activated = false;
  }
}
