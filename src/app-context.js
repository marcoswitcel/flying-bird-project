import { ResourceManager, resourceManager } from './resource-manager.js';
import { SceneManager } from './scene-manager.js';
import { Scene } from './scenes/scene.js';

export class AppContext {
  /**
   * @type {SceneManager}
   */
  sceneManager;

  /**
   * @type {ResourceManager}
   */
  resourceMangager;

  constructor(sceneManager, _resourceManager = resourceManager) {
    this.sceneManager = sceneManager
    this.resourceManager = _resourceManager;
  }

  /**
   * 
   * @param {Scene} scene 
   */
  changeTo(scene) {
    this.sceneManager.entering = scene;
  }
}
