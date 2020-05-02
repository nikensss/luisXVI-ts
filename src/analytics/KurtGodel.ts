import Tweet from './Tweet';
import { default as groupby } from 'group-array';
import YearMonthTweets from './interfaces/YearMonthTweets';
import YearMonthAggregation from './interfaces/YearMonthAggregation';

/**
 * Kurt Gödel is responsible for the mathematic aggregations over each tweet feature
 */
class KurtGodel {
  private _tweets: Tweet[];
  constructor(tweets: Tweet[]) {
    this._tweets = tweets;
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
            throw new Error(
              `[KurtGodel] Property ${prop} is not of type number. It is ${typeof c.get(prop)}`
            );
          }
          return t + <number>c.get(prop);
        }, 0);
      });
    });

    return result;
  }
}

export default KurtGodel;
