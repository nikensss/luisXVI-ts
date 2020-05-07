import Tweet from '../Tweet';

interface PeriodTweets {
  [key: string]: PeriodTweets | Tweet[];
}

export default PeriodTweets;
