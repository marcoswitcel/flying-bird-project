import { Scene } from './scene.js';

export class SceneManager {
  /**
   * @type {Scene|null}
   */
  current = null;
  /**
   * @type {Scene|null}
   */
  entering = null;

  constructor(entering = null) {
    this.entering = entering;
  }

  changeIfNeeds() {
    // roda cleanUp e setup fazendo assim o swap da cena
    if (this.entering) {
      if (this.current) {
        console.log('[SceneManager] cleanUp: ' + this.current.constructor.name)
        this.current.cleanUp();
      }
      
      this.current = this.entering;
      this.entering = null;

      console.log('[SceneManager] setup: ' + this.current.constructor.name)
      this.current.setup();
    }
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} timestamp 
   * @returns 
   */
  execute(ctx, timestamp) {

    if (!this.current) return

    this.current.update(timestamp);
    this.current.render(ctx);
  }
}
