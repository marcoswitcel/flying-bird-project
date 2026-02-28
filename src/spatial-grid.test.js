import { assert } from './test/assert-utils.js';
import { TestCase } from './test/test-case.js';

export class SpatialGridTest extends TestCase {
  ['test']() {
    assert(true, 'Não printa');
    assert(false, 'Print');
  }
  ['test2']() {
    assert(true, 'Não printa');
    assert(false, 'Print');
  }
  beforeEach() {
    console.log('before each')
  }
  beforeAll() {
    console.log('before all')
  }
}
