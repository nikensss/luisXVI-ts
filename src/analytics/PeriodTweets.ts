import Period from './enums/Period';
import Tweet from './Tweet';
import PeriodAggregations from './PeriodAggregations';
import Aggregation from './Aggregation';

class PeriodTweets {
  private _period: Period;
  private _name: string;
  private _data: PeriodTweets[] | Tweet[];

  constructor(period: Period, name: string, data: PeriodTweets[] | Tweet[]) {
    this._period = period;
    this._name = name;
    this._data = data;
  }

  get period(): Period {
    return this._period;
  }

  get name(): string {
    return this._name;
  }

  get data(): PeriodTweets[] | Tweet[] {
    return this._data;
  }

  /**
   * Create a PeriodTweets[] from the returning object of the
   * 'groupby' package.
   *
   * It is expected that the input object will have the following members of
   * type string with a value of object or Tweet[]. These possible object values
   * will have again the same structure until a Tweet[] is found.
   * Something like:
   * {
   *  '2020': {
   *    'January': {
   *      'W0' Tweet[],
   *      'W1': Tweet[]
   *    },
   *    'February': {
   *       'W0' Tweet[],
   *      'W1': Tweet[]
   *    }
   *  },
   * '2019': {
   *    'November': {
   *      'W46' Tweet[],
   *      'W47': Tweet[]
   *    },
   *    'December': {
   *      'W50' Tweet[],
   *      'W51': Tweet[]
   *    }
   *  }
   * }
   * @param object the input data to build a PeriodTweets[] from
   * @param periods the periods in which the tweets where grouped
   */
  static fromAny(object: any, periods: Period[]): PeriodTweets[] {
    const result: PeriodTweets[] = [];
    const entries: [[string, any]] = <[[string, any]]>Object.entries(object);

    //TODO: use better names for entry[0] and entry[1]
    //entry[0]: period name
    //entry[1]: object{[period: object]} | Tweet[]
    for (let entry of entries) {
      if (Array.isArray(entry[1])) {
        result.push(new PeriodTweets(periods[0], entry[0], entry[1]));
      } else {
        result.push(
          new PeriodTweets(
            periods[0],
            entry[0],
            PeriodTweets.fromAny(entry[1], periods.slice(1))
          )
        );
      }
    }

    return result;
  }

  /**
   * Tries to reduce the Tweet[] found at the end of this PeriodTweets with the
   * given reduction algorithm.
   * @param callback the reduction to apply
   * @param initialValue the initial value for the reduction
   */
  sum(metrics: string[]): PeriodAggregations {
    if (this.data.every((t: any) => t instanceof Tweet)) {
      const aggregations: Aggregation[] = metrics.map(m => new Aggregation(m));

      (<Tweet[]>this.data).reduce((t: Aggregation[], c: Tweet) => {
        t.forEach(a => a.add(c.getMetric(a.name)));
        return t;
      }, aggregations);

      return new PeriodAggregations(this.period, this.name, aggregations);
    }

    return new PeriodAggregations(
      this.period,
      this.name,
      (<PeriodTweets[]>this.data).map((d: PeriodTweets) => d.sum(metrics))
    );
  }
}

export default PeriodTweets;
