import { Sprite } from './sprite.js';

export class ResourceManager {

  map = new Map();

  add(path, type, alias) {
    if (type === 'image') {
      const img = new Image();
      img.src = path;
      // @todo João, onload callback, tratar erros também
      img.onload = () => { console.log(`[onload] path="${path}" alias="${alias}"`) };
      img.onabort = () => { console.log(`[onabort] path="${path}" alias="${alias}"`) };
      
      this.map.set(path, img);
      if (alias) {
        this.map.set(alias, img);
      }
    }
  }

  /**
   * 
   * @param {string} alias 
   * @returns {HTMLImageElement|undefined}
   */
  getImage(alias) {
    const value = this.map.get(alias);
    console.assert(value, `requisitando imagem que não foi cadsatra: ${alias}`);

    return value;
  }

  /**
   * 
   * @param {string} alias 
   * @returns {Sprite|null}
   */
  getSprite(alias) {
    const spriteKey = `sprite.${alias}`;
    
    if (this.map.has(spriteKey)) {
      return this.map.get(spriteKey);
    }

    const img = this.getImage(alias);

    if (!img) return null;

    const sprite = new Sprite(img);

    img.onload = () => {
      sprite.width = img.width;
      sprite.height = img.height;
    };

    this.map.set(spriteKey, sprite);

    return sprite;
  }
}

export const resourceManager = new ResourceManager();
