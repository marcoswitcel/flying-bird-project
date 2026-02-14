import { Entity } from './entities.js';

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
