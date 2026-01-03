import { Scene } from './scene.js';

export class SceneManager {

  /**
   * @type {HTMLElement|null}
   */
  rootElement = null;
  /**
   * @type {Scene|null}
   */
  current = null;
  /**
   * @type {Scene|null}
   */
  entering = null;

  /**
   * 
   * @param {HTMLElement} rootElement 
   * @param {Scene} entering 
   */
  constructor(rootElement, entering = null) {
    this.rootElement = rootElement;
    this.entering = entering;
  }

  changeIfNeeds() {
    // roda cleanUp e setup fazendo assim o swap da cena
    if (this.entering) {
      if (this.current) {
        console.log('[SceneManager] cleanUp: ' + this.current.constructor.name)
        this.current.cleanUp(this.rootElement);
      }
      
      this.current = this.entering;
      this.entering = null;

      console.log('[SceneManager] setup: ' + this.current.constructor.name)
      this.current.setup(this.rootElement);
    }
  }

  /**
   * 
   * @param {number} timestamp 
   * @returns 
   */
  execute(timestamp) {

    if (!this.current) return

    this.current.update(timestamp);
    this.current.render();
  }
}
