import LuisXVI from './LuisXVI';
import Feynmann from './datavisualization/Feynman';
import Telegram from './utils/Telegram';

(async () => {
  const luisXVI: LuisXVI = new LuisXVI();
  await luisXVI.fetchData(6);

  const result = await luisXVI.crunch('likes');

  const richard: Feynmann = new Feynmann();
  richard.exportToHtml(result);
  Telegram.getInstance().stopPolling();
})();
