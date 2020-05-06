import Tweet from './Tweet';
import { default as groupby } from 'group-array';
import YearMonthTweets from './interfaces/YearMonthTweets';
import YearMonthAggregation from './interfaces/YearMonthAggregation';

/**
 * The Euler is responsible for the mathematic aggregations over each tweet feature
 */
class Euler {
  private _tweets: Tweet[];
  constructor(tweets: Tweet[]) {
    this._tweets = tweets;
  }

  public sum(prop: string): any {
    const group: any = groupby(this._tweets, 'year', 'semester', 'quarter', 'monthName', 'fortnight', 'week', 'date');
    return this.dive(group, (t: any, c: any) => t + c.get(prop), 0);
  }

  /**
   * Calculates the total sum of the given property value for every month of
   * every year.
   *
   * @param prop property to use for the summation
   */
  public monthlySum(prop: string): YearMonthAggregation {
    const group: YearMonthTweets = <YearMonthTweets>groupby(this._tweets, 'year', 'monthName');
    const result: YearMonthAggregation = <YearMonthAggregation>{};

    const years = Object.keys(group);
    years.forEach((year) => {
      const months = Object.keys(group[year]);
      months.forEach((month) => {
        if (!result[year]) result[year] = {};
        if (!result[year][month]) result[year][month] = 0;

        result[year][month] = group[year][month].reduce((t: number, c: Tweet) => {
          if (typeof c.get(prop) !== 'number') {
            throw new Error(`[Euler] Property ${prop} is not of type number. It is ${typeof c.get(prop)}`);
          }
          return t + <number>c.get(prop);
        }, 0);
      });
    });

    return result;
  }

  public monthlyEngagementRate(): YearMonthAggregation {
    const engagement = this.monthlySum('engagements');
    const impressions = this.monthlySum('impressions');
    const result: YearMonthAggregation = <YearMonthAggregation>{};

    const years = Object.keys(engagement);
    years.forEach((year) => {
      const months = Object.keys(engagement[year]);
      months.forEach((month) => {
        if (!result[year]) result[year] = {};
        if (!result[year][month]) result[year][month] = 0;

        result[year][month] = engagement[year][month] / impressions[year][month];
      });
    });

    return result;
  }

  //Private implementations

  private dive(data: any, callback: (t: number, c: Tweet) => number, initialValue: number): any {
    const r: any = {};

    if (Array.isArray(data)) return data.reduce(callback, initialValue);

    Object.keys(data).forEach((k) => (r[k] = this.dive(data[k], callback, initialValue)));

    return r;
  }
}

export default Euler;

/*
{
  '2020': {
    'S0': {
      'Q0':day´{
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


*/
