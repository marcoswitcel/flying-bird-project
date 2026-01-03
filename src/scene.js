import { AppContext } from './app-context.js';

export class Scene {

  /**
   * @type {AppContext}
   */
  appContext;

  /**
   * 
   * @param {AppContext} appContext
   */
  constructor(appContext) {
    this.appContext = appContext;
  }

  /**
   * @param {HTMLElement|null} rootElement 
   * @returns {void}
   */
  setup(rootElement = null) {}

  /**
   * @param {HTMLElement|null} rootElement 
   * @returns {void} 
   */
  cleanUp(rootElement = null) {}

  /**
   * 
   * @param {number} timestamp 
   * @returns {void}
   */
  update(timestamp) {}

  /**
   * @returns {void}
   */
  render() {}
}
