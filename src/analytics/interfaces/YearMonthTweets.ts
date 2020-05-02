import Tweet from '../Tweet';

interface YearMonthTweets {
  [year: string]: { [month: string]: Tweet[] };
}

export default YearMonthTweets;
