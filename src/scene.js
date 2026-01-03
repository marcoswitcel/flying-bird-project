import { AppContext } from './app-context.js';

export class Scene {

  /**
   * @type {AppContext}
   */
  appContext;

  /**
   * @type {string}
   */
  title;

  /**
   * 
   * @param {AppContext} appContext
   * @param {string} title
   */
  constructor(appContext, title) {
    this.appContext = appContext;
    this.title = title;
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
