import { default as groupby } from 'group-array';
import PeriodAggregations from './PeriodAggregations';
import PeriodTweets from './PeriodTweets';
import Period from './enums/Period';
import Tweet from './Tweet';
import Metric from './enums/Metric';

/**
 * The Analyzer class is responsible for the mathematic
 * aggregations over each tweet metric.
 */
class Analyzer {
  private _tweets: Tweet[];
  constructor(tweets: Tweet[]) {
    this._tweets = tweets;
  }

  //TODO: implement
  // public rate(propA: string, propB: string): PeriodAggregation {
  //   const sumPropA: PeriodAggregation = this.sum(propA);
  //   const sumPropB: PeriodAggregation = this.sum(propB);

  //   return <PeriodAggregation>this.diveRate(sumPropA, sumPropB);
  // }

  public sum(metrics: Metric[], periods: Period[]): PeriodAggregations[] {
    const periodsTweets: PeriodTweets[] = PeriodTweets.fromAny(
      groupby(this._tweets, ...periods),
      periods
    );
    return periodsTweets.map(periodTweets => periodTweets.sum(metrics));
  }
}

export default Analyzer;
