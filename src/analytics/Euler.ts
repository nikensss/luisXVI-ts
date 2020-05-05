import Tweet from './Tweet';
import { default as groupby } from 'group-array';
import YearMonthTweets from './interfaces/YearMonthTweets';
import YearMonthAggregation from './interfaces/YearMonthAggregation';

/**
 * Kurt Gödel is responsible for the mathematic aggregations over each tweet feature
 */
class Euler {
  private _tweets: Tweet[];
  constructor(tweets: Tweet[]) {
    this._tweets = tweets;
  }

  public sum(prop: string): any {
    const group: any = groupby(this._tweets, 'year', 'semester', 'quarter', 'monthName', 'fortnight', 'week', 'date');
    const result: any = Object.assign(group);

    const years = Object.keys(group);
    years.forEach((y) => {
      const semesters = Object.keys(group[y]);
      semesters.forEach((s) => {
        const quarters = Object.keys(group[y][s]);
        quarters.forEach((q) => {
          const months = Object.keys(group[y][s][q]);
          months.forEach((m) => {
            const fortnights = Object.keys(group[y][s][q][m]);
            fortnights.forEach((f) => {
              const weeks = Object.keys(group[y][s][q][m][f]);
              weeks.forEach((w) => {
                const dates = Object.keys(group[y][s][q][m][f][w]);
                dates.forEach((d) => {
                  console.log(group[y][s][q][m][f][w][d][0].constructor.name);
                  result[y][s][q][m][f][w][d] = group[y][s][q][m][f][w][d].reduce(
                    (t: any, c: any) => t + c.get(prop),
                    0
                  );
                });
              });
            });
          });
        });
      });
    });
    // const years = Object.keys(group);
    // years.forEach((year) => {
    //   const months = Object.keys(group[year]);
    //   months.forEach((month) => {
    //     if (!result[year]) result[year] = {};
    //     if (!result[year][month]) result[year][month] = 0;

    //     result[year][month] = group[year][month].reduce((t: number, c: Tweet) => {
    //       if (typeof c.get(prop) !== 'number') {
    //         throw new Error(`[Euler] Property ${prop} is not of type number. It is ${typeof c.get(prop)}`);
    //       }
    //       return t + <number>c.get(prop);
    //     }, 0);
    //   });
    // });
    // console.log(JSON.stringify(result, null, ' '));
    return result;
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
}

export default Euler;

/*

2020: {
  'Gener': {
    '1': 32,
    '2': 12,
    '31': 9
  },
  'Febrer': {
    '3': 24
  }
}

2020: {
  'S0': {
    'Q0':day´{
      'January': {
        'FIFTENTH0': {
          'W0': {
            '1': 0,
            ...
            '7': 0
          },
          'W1': {
            '8': 0,
            ...
            '14': 0
          }
        },
        'FIFTENTH1': {
          'W3': {
            '15': 0,
            ...
            '21': 0
          },
          'W4': {
            '22': 0,
            ...
            '31': 0
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



*/
