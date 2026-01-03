import { SceneManager } from './scene-manager.js';
import { Scene } from './scene.js';

export class AppContext {
  /**
   * @type {SceneManager}
   */
  sceneManager;

  constructor(sceneManager) {
    this.sceneManager = sceneManager
  }

  /**
   * 
   * @param {Scene} scene 
   */
  changeTo(scene) {
    this.sceneManager.entering = scene;
  }
}
