import { Sprite } from './sprite.js';

const log = (...args) => console.log('[ResourceManager]', ...args);

/**
 * @typedef {'json'|'image'} ResourceType
 * @typedef {Sprite | HTMLImageElement | Promise<any>} ResourceEntry
 */

export class ResourceManager {

  /**
   * @private
   * @type {Map<string, ResourceEntry>}
   */
  _map = new Map();

  /**
   * 
   * @param {string} path caminho do asset
   * @param {ResourceType} type tipo do recurso
   * @param {string} alias nome do asset
   */
  add(path, type, alias) {
    if (type === 'image') {
      const img = new Image();
      img.src = path;
      // @todo João, onload callback, tratar erros também
      img.onload = () => { log(`[onload] path="${path}" alias="${alias}"`) };
      img.onabort = () => { log(`[onabort] path="${path}" alias="${alias}"`) };
      img.onerror = () => { log(`[onerror] path="${path}" alias="${alias}"`) };
      
      this.setAsset(path, img, alias);
    } else if (type === 'json') {
      const promise = fetch(path);
      this.setAsset(path, promise, alias);

      promise
        .then(blob => blob.json())
        .then(json => {
          log(`[onload] path="${path}" alias="${alias}"`);
          this.setAsset(path, json, alias);
        })
        // @ts-ignore
        .catch(error => {
          log(`[onerror] path="${path}" alias="${alias}"`);
        })
    }
  }

  /**
   * 
   * @param {string} alias 
   * @returns {HTMLImageElement|undefined}
   */
  getImage(alias) {
    const value = this._map.get(alias);
    // @ts-ignore
    console.assert(value, `requisitando imagem que não foi cadastrada: ${alias}`);

    // @ts-ignore
    return value;
  }

  /**
   * 
   * @param {string} alias 
   * @returns {object}
   */
  getJson(alias) {
    const value = this._map.get(alias);
    // @ts-ignore
    console.assert(value, `requisitando json que não foi cadastrado: ${alias}`);

    return value;
  }

  /**
   * 
   * @param {string} alias 
   * @returns {Sprite|null}
   */
  getSprite(alias) {
    const spriteKey = `sprite.${alias}`;
    
    if (this._map.has(spriteKey)) {
      // @ts-ignore aqui eu sei que chaves `sprite.*` contém sprites ou null
      return this._map.get(spriteKey) || null;
    }

    const img = this.getImage(alias);

    if (!img) return null;

    const sprite = new Sprite(img);

    // @todo João, falta lidar com erro aqui..., usar textura padrão
    if (img.complete) {
      sprite.width = img.width;
      sprite.height = img.height;
    } else {
      img.addEventListener('load', () => {
        sprite.width = img.width;
        sprite.height = img.height;
      });
    }

    this.setAsset(spriteKey, sprite);

    return sprite;
  }

  isAllLoaded() {
    // @note pode ser bem lento isso aqui... muito trabalho duplicado
    return this.numberOfResources() === this.numberOfResourcesLoaded();
  }

  /**
   * 
   * @param {string} path 
   * @param {ResourceEntry} value 
   * @param {string|null} alias 
   */
  setAsset(path, value, alias = null) {
    this._map.set(path, value);
    if (alias) {
      console.assert(!this._map.has(alias) || isPromise(this._map.get(alias)), `Alias duplicad: ${alias}`)
      this._map.set(alias, value);
    }
  }

  numberOfResources() {
    return this._map.size;
  }

  numberOfResourcesLoaded() {
    let count = 0;
    for (const [_, value] of this._map.entries()) {
      
      if (isPromise(value)) continue;

      if (value instanceof HTMLImageElement) {
        count += Number(value.complete);
      } else {
        count += 1;
      }

    }
    return count;
  }
}

const isPromise = (maybePromise) => (typeof maybePromise === 'object' || typeof maybePromise === 'function') && typeof maybePromise.then === 'function';

export const resourceManager = new ResourceManager();
