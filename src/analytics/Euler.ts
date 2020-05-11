import { default as groupby } from 'group-array';
import PeriodAggregations from './PeriodAggregations';
import PeriodTweets from './PeriodTweets';
import Period from './enums/Period';
import Tweet from './Tweet';

/**
 * Mr Leonhard Euler is responsible for the mathematic
 * aggregations over each tweet metric.
 */
class Euler {
  private _tweets: Tweet[];
  constructor(tweets: Tweet[]) {
    this._tweets = tweets;
  }

  // public rate(propA: string, propB: string): PeriodAggregation {
  //   const sumPropA: PeriodAggregation = this.sum(propA);
  //   const sumPropB: PeriodAggregation = this.sum(propB);

  //   return <PeriodAggregation>this.diveRate(sumPropA, sumPropB);
  // }

  public sum(metrics: string[], periods: Period[]): PeriodAggregations[] {
    const periodsTweets: PeriodTweets[] = PeriodTweets.fromAny(groupby(this._tweets, ...periods), periods);
    return periodsTweets.map((periodTweets) => periodTweets.sum(metrics));
  }
}

export default Euler;
