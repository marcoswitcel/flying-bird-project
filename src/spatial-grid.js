import { Entity } from './entities.js';


/**
 * @brief função hash simples, autor mencionado abaixo
 * 
 * @note hash function design by Daniel J. Bernstein (djb):
 * @author Daniel J. Bernstein (original design) (this version was ported by João)
 * @reference https://www.reddit.com/r/learnprogramming/comments/1h5gmb/creating_a_simple_hash_function/ 
 * 
 * @param {Uint8Array} data 
 * @returns {number}
 */
function hash(data)
{
  let hash = 5381;
  let byte;

  for (let i = 0; i < data.length; i++) {
    byte = data[i];
    hash = (((hash << 5) + hash) + byte) | 0;
  }

  return hash >>> 0;
}

/**
 * @todo João, integrar e testar hash
 * @param {number} x 
 * @param {number} y 
 */
function hashPosition(x, y) {
  const bytesPerNumber = 8;
  const buffer = new ArrayBuffer(bytesPerNumber * 2);
  const view = new Float64Array(buffer);
  
  // o "+ 0" é para converter -0 em 0, caso seja -0, se for outro valor não vai alterar
  view[0] = x + 0;
  view[1] = y + 0;

  return hash(new Uint8Array(buffer));
}

/**
 * @todo João, terminar de implementar os métodos
 * @todo João, implementar o grid em paralelo com o código atual e validar se o
 * código atual e o grid encontram as mesmas entidades. Vai ser necessário ajustar 
 * o código atual para adicionar as entidades renderizada a uma lista para fins de comparação.
 */
export class SpatialGrid {
  /**
   * @private
   * @type {Map<number, Set<Entity> | undefined> & Map<Entity, Set<number> | undefined>}
   */
  grid;

  /**
   * @readonly
   * @type {number}
   */
  cellSize;

  /**
   * 
   * @param {number} cellSize 
   */
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

    
  /**
   * @todo joão, refatorar o resto
   * @param {Entity} entity 
   */
  insert(entity) {
    const hashs = this.getHashs(entity);


    for (const hash of hashs) {
      this.getOrCreatePartition(hash).add(entity);
    }

    console.assert(!this.grid.has(entity), 'Não deveria tentar inserir duplicado');
    
    this.grid.set(entity, hashs)
  }

  /**
   * @todo João, testar
   * 
   * @param {Entity} entity 
   * @returns 
   */
  update(entity) {
    const hashs = this.getHashs(entity);
    const oldHashs = this.grid.get(entity);

    console.assert(!!oldHashs, 'Não deveria tentar atualizar uma entidade não inserida');
 
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
    
    this.grid.set(entity, hashs)
  }

  /**
   * 
   * @param {Entity} entity 
   */
  remove(entity) {
    const oldHashs = this.grid.get(entity);

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
    
    this.grid.delete(entity)
  }

  /**
   * 
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
        const hash = hashPosition(i, j);
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
   * 
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

  clear() {
    this.grid.clear()
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

    for (let x = xStart; x < xEnd; x++) {
      for (let y = yStart; y < yEnd; y++) {
        hashs.add(hashPosition(x, y));
      }
    }

    return hashs;
  }
}
