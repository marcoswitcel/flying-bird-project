import { Entity } from './entities.js';
import { SpatialGrid } from './spatial-grid.js';
import { assert, hiddenAssert } from './test/assert-utils.js';
import { TestCase } from './test/test-case.js';

export class SpatialGridTest extends TestCase {
  
  ['deveria estar vazio após criação']() {
    const spatialGrid = new SpatialGrid(128);

    assert(spatialGrid.size === 0, 'Deveria estar vazio')
  }

  ['adicionar entidades']() {
    const spatialGrid = new SpatialGrid(128);
    const entity = new Entity();
    const entity2 = new Entity();

    spatialGrid.insert(entity);

    assert(spatialGrid.size === 1, 'Deveria registrar a entidade')

    spatialGrid.insert(entity2);

    assert(spatialGrid.size === 2, 'Deveria registrar a segunda entidade')
  }

  ['remover uma entidade']() {
    const spatialGrid = new SpatialGrid(128);
    const entity = new Entity();

    spatialGrid.insert(entity);
    hiddenAssert(spatialGrid.size === 1, 'Deveria registrar a entidade')
    spatialGrid.remove(entity);

    assert(spatialGrid.size === 0, 'Deveria estar vazio após remover')
  }
}
