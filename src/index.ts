import LuisXVI from './LuisXVI';
import Telegram from './utils/Telegram';

(async () => {
  const luisXVI: LuisXVI = new LuisXVI();
  // await luisXVI.fetchData(24);
  await luisXVI.crunch();
  Telegram.getInstance().stopPolling();
})();
