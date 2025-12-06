import { Vector2 } from './vector2.js';

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @param {string} color 
 */
export const drawRect = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @param {number} lineWidth 
 * @param {string} color 
 */
export const drawRectStroke = (ctx, x, y, w, h, lineWidth, color) => {
  ctx.setLineDash([lineWidth, lineWidth])
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, w, h);
}

/**
 * @note links úteis:
 * * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign}
 * * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline}
 * * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textRendering}
 * 
 * @param {CanvasRenderingContext2D} ctx contexto atual
 * @param {string} text texto a ser exibido
 * @param {Vector2} position posição do texto
 * @param {number} size tamanho do texto de 0 a 1, será mapeado para uma fração do tamanho do canvas
 * @param {string} fillStyle cor de preenchimento
 * @param {string} fontFamily fonta desejada
 * @param {CanvasTextAlign} textAlign alinhamento horizontal do texto
 * @param {CanvasTextBaseline} textBaseline alinhamento vertical do texto
 */
export function drawText(ctx, text, position, size, fillStyle = '#FFFFFF', fontFamily = 'serif', textAlign = 'center', textBaseline = 'middle') {
  ctx.font = `${size}px ${fontFamily}`;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillText(text, position.x, position.y);
}

