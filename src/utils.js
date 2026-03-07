
/**
 * @param {any[]} array 
 * @param {any} value
 */
export function arrayRemoveInPlace(array, value) {
  const index = array.indexOf(value);

  if (index > -1) {
    array.splice(index, 1);
  }
}
