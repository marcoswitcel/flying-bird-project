
export class Sprite {
  source;
  width;
  height;
  offsetX;
  offsetY;

  /**
   * 
   * @param {CanvasImageSource} source 
   * @param {number?} width 
   * @param {number?} height 
   * @param {number?} offsetX 
   * @param {number?} offsetY 
   */
  constructor(source, width = 0, height = 0, offsetX = 0, offsetY = 0) {
    this.source = source;
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {{ x: number, y: number }} position coordenada no espaço da tela
   * @param {{ x: number, y: number }} dimensions em pixel
   * @param {boolean} centered
   */
  render(ctx, position, dimensions, centered = false ) {
    let x = position.x;
    let y = position.y;
    if (centered) {
      x -= dimensions.x / 2;
      y -= dimensions.y / 2;
    }

    ctx.drawImage(this.source, this.offsetX, this.offsetY, this.width, this.height, x, y, dimensions.x, dimensions.y);
  }
}
