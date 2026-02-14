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
   * @type {Map<number, Entity>}
   */
  grid;

  /**
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

    
  insert(entity) {
    // @todo João, implementar
    // Talvez fazer o hash da coordernada x e y e usar o número no map?
  }

  update(entity) {
    // @todo João, implementar
  }

  remove(entity) {
    // @todo João, implementar
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   */
  query(x, y, width, height) {
    // @todo João, implementar
  }
}
