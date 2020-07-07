import Metric from './enums/Metric';

class Aggregation {
  private _name: Metric;
  private _value: number;

  constructor(name: Metric, value: number = 0) {
    if (value < 0) throw new Error('Invalid value');

    this._name = name;
    this._value = value;
  }

  get name(): Metric {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  add(n: number): void {
    if (n < 0) {
      throw new Error('Invalid argument exception: n must be 0 or positive');
    }
    this._value += n;
  }
}

export default Aggregation;
