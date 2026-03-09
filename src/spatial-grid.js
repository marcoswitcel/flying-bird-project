import { Entity } from './entities.js';
import { hash } from './hash.js';


class PositionHasher {
  constructor() {
    const bytesPerNumber = 8;

    this.buffer = new ArrayBuffer(bytesPerNumber * 2);
    this.view = new Float64Array(this.buffer);
    this.bytes = new Uint8Array(this.buffer)
  }

  /**
   * Faz o hash dos números
   * 
   * @param {number} x 
   * @param {number} y 
   */
  hash(x, y) {
    // o "+ 0" é para converter -0 em 0, caso seja -0, se for outro valor não vai alterar
    this.view[0] = x + 0;
    this.view[1] = y + 0;
  
    return hash(this.bytes);
  }
}


/**
 * @todo João, implementar o grid em paralelo com o código atual e validar se o
 * código atual e o grid encontram as mesmas entidades. Vai ser necessário ajustar 
 * o código atual para adicionar as entidades renderizada a uma lista para fins de comparação.
 */
export class SpatialGrid {
  /**
   * @private
   * @type {Map<number, Set<Entity> | undefined>}
   */
  grid;
  
  /**
   * @private
   * @type {Map<Entity, Set<number> | undefined>}
   */
  entitiesHash;

  /**
   * @readonly
   * @type {number}
   */
  cellSize;

  /**
   * @private
   * @type {PositionHasher}
   */
  hasher;

  /**
   * @readonly
   * @type {number}
   */
  get size() {
    return this.entitiesHash.size;
  }

  /**
   * 
   * @param {number} cellSize 
   */
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
    this.entitiesHash = new Map();
    this.hasher = new PositionHasher();
  }

    
  /**
   * @todo joão, refatorar o resto
   * @param {Entity} entity 
   */
  insert(entity) {

    if (this.entitiesHash.has(entity)) {
      console.assert(false, 'Não deveria tentar inserir duplicado');
      return;
    }

    const hashs = this.getHashs(entity);

    for (const hash of hashs) {
      this.getOrCreatePartition(hash).add(entity);
    }

    this.entitiesHash.set(entity, hashs)
  }

  /**
   * @todo João, testar
   * @public
   * @param {Entity} entity 
   * @returns 
   */
  update(entity) {
    const oldHashs = this.entitiesHash.get(entity);

    if (!oldHashs) {
      console.assert(false, 'Não deveria tentar atualizar uma entidade não inserida');
      return;
    }

    const hashs = this.getHashs(entity);
 
    for (const hash of oldHashs) {
      const set = this.grid.get(hash);

      if (set) {
        set.delete(entity)
        if (!set.size) {
          this.grid.delete(hash);
        }
      }
    }

    for (const hash of hashs) {
      this.getOrCreatePartition(hash).add(entity);
    }
    
    this.entitiesHash.set(entity, hashs)
  }

  /**
   * @public
   * @param {Entity} entity 
   */
  remove(entity) {
    const oldHashs = this.entitiesHash.get(entity);

    console.assert(!!oldHashs, 'Não deveria tentar remover uma entidade não inserida');
 
    for (const hash of oldHashs) {
      const set = this.grid.get(hash);

      if (set) {
        set.delete(entity)
        if (!set.size) {
          this.grid.delete(hash);
        }
      }
    }
    
    this.entitiesHash.delete(entity)
  }

  /**
   * 
   * @public
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   */
  query(x, y, width, height) {
    const xStart =  Math.floor((x - width / 2) / this.cellSize);
    const xEnd =  Math.floor((x + width / 2) / this.cellSize);
    const yStart =  Math.floor((y - height / 2) / this.cellSize);
    const yEnd =  Math.floor((y + height / 2) / this.cellSize);

    /**
     * @type {Set<Entity>}
     */
    const entities = new Set()

    for (let i = xStart; i <= xEnd; i++) {
      for (let j = yStart; j <= yEnd; j++) {
        const hash = this.hasher.hash(i, j);
        const set = this.grid.get(hash);
        if (set) {
          for (const value of set) {
            entities.add(value);
          }
        }
      }
    }

    return entities;
  }

  /**
   * @private
   * @param {number} hash 
   */
  getOrCreatePartition(hash) {
    let entitiesSet = this.grid.get(hash);

    if (!entitiesSet) {
      entitiesSet = new Set();
      this.grid.set(hash, entitiesSet)
    }

    return entitiesSet;
  }

  /**
   * @public
   */
  clear() {
    this.grid.clear()
    this.entitiesHash.clear()
  }

  /**
   * @private
   * @param {Entity} entity 
   * @returns {Set<number>}
   */
  getHashs(entity) {
    // descobrindo celula que o elemento ficaria
    const rect = entity.getVisibleRect()

    const xStart =  Math.floor((rect.position.x - rect.dimensions.x / 2) / this.cellSize);
    const xEnd =  Math.floor((rect.position.x + rect.dimensions.x / 2) / this.cellSize);
    const yStart =  Math.floor((rect.position.y - rect.dimensions.y / 2) / this.cellSize);
    const yEnd =  Math.floor((rect.position.y + rect.dimensions.y / 2) / this.cellSize);
    
    // @todo joão, poder ser mais lento que usar string, mas vou ver de usar bitwise pra computar depois...
    /**
     * @type {Set<number>}
     */
    const hashs = new Set();

    for (let x = xStart; x <= xEnd; x++) {
      for (let y = yStart; y <= yEnd; y++) {
        hashs.add(this.hasher.hash(x, y));
      }
    }

    return hashs;
  }
}
