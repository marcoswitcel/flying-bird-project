
/**
 * @todo João, testar
 */
export class TimeManager {

  /**
   * 
   * @type {number}
   */
  static timestamp = 0;
  /**
   * Update nesse frame
   * @type {number}
   */
  static deltaTime = 0;
  // tempos usados para controlar a timeline
  static currentTimestamp = 0;
  static lastTimestamp = 0;

  static update(timestamp) {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.timestamp = 0;
      this.currentTimestamp = timestamp;
      this.deltaTime = 0;
      return;
    }

    this.lastTimestamp = this.currentTimestamp;
    this.currentTimestamp = timestamp;
    this.deltaTime = this.currentTimestamp - this.lastTimestamp;
    this.timestamp += this.deltaTime;
  }

  static stoped() {
    this.deltaTime = 0
  }
}

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

/**
 * @todo João, considerar como controlar as animações, adicionar um campo timestamp pra representar o começo da animação?
 * que pode ou não ser baseado no timestamp do navegador? não seria melhor incrementar a animação em si? não seria melhor
 * ter um campo 'paused'? um método start? e um método advance (pra atualizar o tempo)?
 */
export class AnimatedSprite {
  /**
   * Imagens/frames que compẽom a animação
   * @type {Sprite[]}
   */
  frames;

  /**
   * Duração em milisegundos. E.x: para durar 2 segundos o valor seria 2000 (porque está em milisegundos)
   * @type {number}
   */
  length;

  /**
   * @type {number}
   */
  elapsedTime = 0;

  /**
   * @type {boolean}
   */
  paused = false;

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
    // @todo joão, mover esse if, adiciona duplicado...
    if (!this.paused) {
      this.elapsedTime += TimeManager.deltaTime
    }
    const tick = this.elapsedTime;
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
