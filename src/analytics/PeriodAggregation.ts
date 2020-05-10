import Period from './enums/Period';
import Tweet from './Tweet';

class PeriodAggregation {
  private _period: Period;
  private _value: string;
  private _data: PeriodAggregation[] | Tweet[];

  constructor(period: Period, value: string, data: PeriodAggregation[] | Tweet[]) {
    this._period = period;
    this._value = value;
    this._data = data;
  }

  get period(): Period {
    return this._period;
  }

  get value(): string {
    return this._value;
  }

  get data(): PeriodAggregation[] | Tweet[] {
    return this._data;
  }

  static fromAny(object: any, periods: Period[]): PeriodAggregation[] {
    const result: PeriodAggregation[] = [];
    const entries: [[string, any]] = <[[string, any]]>Object.entries(object);

    for (let entry of entries) {
      if (Array.isArray(entry[1])) {
        result.push(new PeriodAggregation(periods[0], entry[0], entry[1]));
      } else {
        result.push(new PeriodAggregation(periods[0], entry[0], PeriodAggregation.fromAny(entry[1], periods.slice(1))));
      }
    }

    return result;
  }
}

export default PeriodAggregation;
