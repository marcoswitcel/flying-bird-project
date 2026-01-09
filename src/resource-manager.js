import { Sprite } from './sprite.js';

const log = (...args) => console.log('[ResourceManager]', ...args);

export class ResourceManager {

  /**
   * @private
   * @type {Map<string, any>}
   */
  _map = new Map();

  /**
   * 
   * @param {string} path caminho do asset
   * @param {'image'|'json'} type tipo do recruso
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
      
      this.setAsset(path, alias, img);
    } else if (type === 'json') {
      const promise = fetch(path);
      this.setAsset(path, alias, promise);

      promise
        .then(blob => blob.json())
        .then(json => {
          log(`[onload] path="${path}" alias="${alias}"`);
          this.setAsset(path, alias, json);
        })
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
    console.assert(value, `requisitando imagem que não foi cadastrada: ${alias}`);

    return value;
  }

  /**
   * 
   * @param {string} alias 
   * @returns {object}
   */
  getJson(alias) {
    const value = this._map.get(alias);
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
      return this._map.get(spriteKey);
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

    this._map.set(spriteKey, sprite);

    return sprite;
  }

  isAllLoaded() {
    // @note pode ser bem lento isso aqui... muito trabalho duplicado
    return this.numberOfResources() === this.numberOfResourcesLoaded();
  }

  /**
   * 
   * @param {string} path 
   * @param {string} alias 
   * @param {any} value 
   */
  setAsset(path, alias, value) {
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
