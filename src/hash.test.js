import { TestCase } from './test/test-case.js';
import { hash } from './hash.js';
import { assert, hiddenAssert } from './test/assert-utils.js';

export class HashTest extends TestCase {
  ['É determinístico']() {

    const samples = [ 'string', 'Maçã', 'Professor', '7', '0.123' ];

    for (const sample of samples) {
      const input = new TextEncoder().encode(sample);
      let result = hash(input);
      let result2 = hash(input);
  
      assert(result === result2, 'Um dado de entrada sempre gera o mesmo hash (para todos as amostras de texto)');
    }
  }

  ['Pequenas mudanças alteram o retorno']() {
    const samples = [ 'string', 'Maçã', 'Professor', '7', '0.123' ];

    for (const sample of samples) {
      const input = new TextEncoder().encode(sample);
      let result = hash(input);
      const input2 = new TextEncoder().encode(sample + '*');
      let result2 = hash(input2);
  
      assert(result !== result2, 'Deveria gerar um hash diferente (para todos as amostras de texto)');
    }
  }

  ['Dados sequenciais geram hash muito diversos']() {
    const data = Uint8Array.from([ 33, 0 ]);
    const set = new Set();
    let lastHash = hash(data);
    set.add(lastHash);
    for (let i = 1; i < 256; i++) {
      data[1] = i;
      let result = hash(data);
      assert(lastHash !== result, 'Deveria gerar um hash diferente (para todos as amostras de sequenciais)');
      hiddenAssert(!set.has(result), 'Deveria gerar um hash diferente (para todos as amostras de sequenciais)');
      set.add(result);
      lastHash = result;
    }
  }
}