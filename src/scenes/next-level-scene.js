import { AppContext } from '../app-context.js';
import { GameScene } from './game-scene.js';
import { LevelSelectionScene } from './level-selection-scene.js';
import { MenuScene } from './menu-scene.js';
import { Scene } from '../scene.js';

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

.hidden {
  display: none;
}
`

const html = `
<div class="container">
  <button class="button" type="button" id="btnNextLevel">Próximo Nível</button>
  <button class="button" type="button" id="btnMenu">Menu</button>
</div>
`

export class NextLevelScene extends Scene {

  /**
   * 
   * @param {AppContext} appContext
   * @param {string} currentLevel
   */
  constructor(appContext, currentLevel) {
    super(appContext, 'Próximo Nível');
    this.currentLevel = currentLevel;
  }

  /**
   * @param {HTMLElement|null} rootElement 
   */
  setup(rootElement = null) {
    // @todo joão, temporário 
    rootElement.innerHTML = html

    this.appContext.sceneManager.updateStyle(style);

    const [filename, worldName, ...rest] = this.currentLevel.split('/').reverse();
    console.assert(!!filename && !!worldName, 'Nome do nível ' + this.currentLevel);
    const index = Number(filename.replace('.json', ''));
    console.assert(!isNaN(index), 'Deveria ser numérico' + this.currentLevel);
    const nextLevel = String(index + 1).padStart(2, '0');
    /**
     * @type {ApplicationTypes.CampaignJson}
     */
    const campaign = this.appContext.resourceManager.getJson('campaign');
    const world = campaign.worlds.filter(world => world.name === worldName)[0];

    if (world?.levels.includes(nextLevel)) {
      const newPath = rest.reverse();
      newPath.push(worldName);
      newPath.push(`${nextLevel}.json`);
      
      rootElement.querySelector('#btnNextLevel').addEventListener('click', () => {
        this.appContext.changeTo(new GameScene(this.appContext, newPath.join('/')));
      })
    } else {
      rootElement.querySelector('#btnNextLevel').classList.add('hidden')
    }

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
