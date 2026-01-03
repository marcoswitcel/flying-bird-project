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
   */
  setup(rootElement = null) {}
  /**
   * @param {HTMLElement|null} rootElement 
   */
  cleanUp(rootElement = null) {}

  update(timestamp) {}
  render() {}
}
