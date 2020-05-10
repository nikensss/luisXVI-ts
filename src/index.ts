import LuisXVI from './LuisXVI';
import Feynmann from './datavisualization/Feynman';
import Telegram from './utils/Telegram';
import PeriodAggregation from './analytics/PeriodAggregation';

(async () => {
  const luisXVI: LuisXVI = new LuisXVI();
  // await luisXVI.fetchData(24);

  const result: PeriodAggregation[] = await luisXVI.crunch('tweets', 'likes', 'replies');

  const richard: Feynmann = new Feynmann();
  richard.exportToHtml(result);
  // Telegram.getInstance().stopPolling();
})();
