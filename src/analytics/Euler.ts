import Tweet from './Tweet';
import { default as groupby } from 'group-array';
import PeriodAggregation from './interfaces/PeriodAggregation';
import PeriodTweets from './interfaces/PeriodTweets';
import Period from './enums/Period';

/**
 * The Euler is responsible for the mathematic aggregations over each tweet feature
 */
class Euler {
  private _tweets: Tweet[];
  constructor(tweets: Tweet[]) {
    this._tweets = tweets;
  }

  public rate(propA: string, propB: string): PeriodAggregation {
    const sumPropA: PeriodAggregation = this.sum(propA);
    const sumPropB: PeriodAggregation = this.sum(propB);

    return <PeriodAggregation>this.diveRate(sumPropA, sumPropB);
  }

  public sum(prop: string): PeriodAggregation {
    const group: PeriodTweets = <PeriodTweets>groupby(
      this._tweets,
      Period.YEAR,
      // Period.SEMESTER,
      // Period.QUARTER,
      Period.MONTH_NAME
      // Period.FORTNIGHT,
      // Period.WEEK,
      // Period.DATE
    );
    return <PeriodAggregation>this.diveReduce(group, (t: any, c: any) => t + c.get(prop), 0);
  }

  //Private implementations

  private diveReduce(
    data: PeriodTweets | Tweet[],
    callback: (t: number, c: Tweet) => number,
    initialValue: number
  ): PeriodAggregation | number {
    const r: PeriodAggregation = {};

    if (Array.isArray(data)) return data.reduce(callback, initialValue);

    Object.keys(data).forEach((k) => (r[k] = this.diveReduce(data[k], callback, initialValue)));

    return r;
  }

  private diveRate(a: PeriodAggregation | number, b: PeriodAggregation | number): PeriodAggregation | number {
    const r: PeriodAggregation = {};

    if (typeof a === 'number' && typeof b === 'number') return a / b;

    Object.keys(a).forEach((k) => (r[k] = this.diveRate(a, b)));

    return r;
  }
}

export default Euler;

/*
________________________________________________
| Year  | Semester | Quarter | MonthName | Fortnight | Week | Day | Likes
--------------------------------------------------------------------
| 2020 | Febrer | W5      | 32  
|               | W6      | 26
|
|




*/

/*
{
  '2020': {
    'S0': {
      'Q0': {
        'January': {
          'FORTNIGHT0': {
            'W0': {
              '1': Tweet[],
              ...
              '7': Tweet[]
            },
            'W1': {
              '8': Tweet[],
              ...
              '14': Tweet[]
            }
          },
          'FORTNIGHT1': {
            'W3': {
              '15': Tweet[],
              ...
              '21': Tweet[]
            },
            'W4': {
              '22': Tweet[],
              ...
              '31': Tweet[]
            }
          }
        },
        'February': {
        
        }
      }

    
    },
    'S1': {
    
    }
  }
}

{
  '2020': {
    'January': Tweet[]
  }
}

*/
