
export class Vector2 {
  /**
   * @type {number}
   */
  x;
  /**
   * @type {number}
   */
  y;
 
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  addScalar(number) {
    this.x += number;
    this.y += number;

    return this;
  }

  add(vec) {
    this.x += vec.x;
    this.y += vec.y;

    return this;
  }

  subScalar(number, number2 = number) {
    this.x -= number;
    this.y -= number2;

    return this;
  }

  sub(vec) {
    this.x -= vec.x;
    this.y -= vec.y;

    return this;
  }

  mulScalar(x, y = x) {
    this.x *= x;
    this.y *= y;

    return this;
  }

  mul(vec) {
    this.x *= vec.x;
    this.y *= vec.y;

    return this;
  }

  copy() {
    return new Vector2(this.x, this.y);
  }
}

export const vec2 = (x = 0, y = 0) => new Vector2(x, y);
