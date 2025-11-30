
/**
 * @typedef {{
 *  source: CanvasImageSource,
 *  width: number,
 *  height: number,
 *  render: (ctx: CanvasRenderingContext2D, position: { x: number, y: number, }, dimensions: { x: number, y: number, }, centered: boolean ) => void
 * }} RenderableSprite
 */

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

export class AnimatedSprite {
  /**
   * @type {Sprite[]}
   */
  frames;

  /**
   * @type {number}
   */
  length;

  /**
   * 
   * @param {Sprite[]} frames 
   * @param {number} length 
   */
  constructor(frames, length) {
    this.frames = frames;
    this.length = length;
  }

  get width() {
    return this.currentFrame.width;
  }

  get height() {
    return this.currentFrame.height;
  }

  get source() {
    return this.currentFrame.source;
  }

  get currentFrame() {
    const tick = performance.now();
    // @todo João, ajustar isso aqui...
    const index = ~~(~~(~~tick % (this.length)) / (this.length / this.frames.length)) % this.frames.length;
    return this.frames[index];
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {{ x: number, y: number }} position coordenada no espaço da tela
   * @param {{ x: number, y: number }} dimensions em pixel
   * @param {boolean} centered
   */
  render(ctx, position, dimensions, centered = false ) {
    this.currentFrame.render(ctx, position, dimensions, centered);
  }
}
