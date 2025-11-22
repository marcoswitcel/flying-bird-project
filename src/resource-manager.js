
export class ResourceManager {

  map = new Map();

  add(path, type, alias=null) {
    if (type === 'image') {
      const img = new Image();
      img.src = path;
      // @todo João, onload callback, tratar erros também
      img.onload = () => {};
      
      this.map.set(path, img);
      if (alias) {
        this.map.set(alias, img);
      }
    }
  }
}

export const resourceManager = new ResourceManager();
