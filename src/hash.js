
/**
 * @brief função hash simples
 * 
 * @note hash function design by Daniel J. Bernstein (djb):
 * @author Daniel J. Bernstein (original design) (this version was ported by João)
 * @reference https://www.reddit.com/r/learnprogramming/comments/1h5gmb/creating_a_simple_hash_function/ 
 * 
 * @param {Readonly<Uint8Array>} data 
 * @returns {number}
 */
export function hash(data)
{
  let hash = 5381;
  let byte;

  for (let i = 0; i < data.length; i++) {
    byte = data[i];
    hash = (((hash << 5) + hash) + byte) | 0;
  }

  return hash >>> 0;
}
