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

   ['limpando SpatialGrid']() {
    const spatialGrid = new SpatialGrid(128);
    const entity = new Entity();
    const entity2 = new Entity();

    spatialGrid.insert(entity);
    hiddenAssert(spatialGrid.size === 1, 'Deveria registrar a entidade')

    spatialGrid.insert(entity2);
    hiddenAssert(spatialGrid.size === 2, 'Deveria registrar a entidade')

    spatialGrid.clear();
    assert(spatialGrid.size === 0, 'Deveria estar vazio após remover')
  }

  ['query SpatialGrid']() {
    const spatialGrid = new SpatialGrid(128);
    const entity = new Entity();
    
    entity.position.x = 100;
    entity.position.y = 100;
    entity.dimension.x = 50;
    entity.dimension.y = 50;

    spatialGrid.insert(entity);
    hiddenAssert(spatialGrid.size === 1, 'Deveria registrar a entidade')

    const result = spatialGrid.query(0, 0, 100, 100);
    assert(result.size === 1, 'Deveria retornar a célula com a entidade')

    const result2 = spatialGrid.query(300, 0, 100, 100);
    assert(result2.size === 0, 'Não deveria encontrar a entidade')

    const result3 = spatialGrid.query(300, 0, 600, 600);
    assert(result3.size === 1, 'Deveria encontrar a entidade')
  }
}
