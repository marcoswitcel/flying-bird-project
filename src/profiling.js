
/**
 * @note João, considerar implementar uma versão que recebe "labels" e armazena o valor para cada um deles. Assim,
 * não seria necessário criar uma instância dessa classe para cada trecho que desejo fazer o "profile", já que se dois trechos estão ativos
 * simulataneamente não dá pra usar a mesma instância, ela sobrescrever o valor inicial.
 */
export class TimerProfile {
  /**
   * @private
   * @type {number}
   */
  _start = 0;
  /**
   * @private
  * @type {number}
  */
  _end = 0;

  timeStart() {
    this._start = performance.now();
    return this._start;
  }

  timeEnd() {
    this._end = performance.now();
    return this._end;
  }

  timeLog(message) {
    
    if (this._end === 0) this.timeEnd();

    const result = this._end - this._start;
    
    console.log(message, result);

    return result;
  }
}
