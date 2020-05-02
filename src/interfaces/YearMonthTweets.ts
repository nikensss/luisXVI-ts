import Tweet from '../analytics/Tweet';

interface YearMonthTweets {
  [year: string]: { [month: string]: Tweet[] };
}

export default YearMonthTweets;
