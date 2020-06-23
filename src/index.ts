import LuisXVI from './LuisXVI';
import Feynmann from './datavisualization/Visualizer';
import Telegram from './utils/Telegram';
import PeriodAggregations from './analytics/PeriodAggregations';
import Metric from './analytics/enums/Metric';
import Period from './analytics/enums/Period';

(async () => {
  const luisXVI: LuisXVI = new LuisXVI();
  //await luisXVI.fetchData(2);

  const metrics: Metric[] = [
    Metric.TWEETS,
    Metric.LIKES,
    Metric.RETWEETS,
    Metric.REPLIES
  ];
  const periods: Period[] = [
    Period.YEAR,
    Period.SEMESTER,
    Period.QUARTER,
    Period.MONTH
  ];
  const result: PeriodAggregations[] = await luisXVI.crunch({
    metrics,
    periods
  });

  const richard: Feynmann = new Feynmann();
  richard.export(result);
  // Telegram.getInstance().stopPolling();
})();
