import LuisXVI from './LuisXVI';
import dotenv from 'dotenv';
import Telegram from './utils/Telegram';

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
process.env.NTBA_FIX = '1';

(async () => {
  const luisXVI: LuisXVI = new LuisXVI();
  // await luisXVI.fetchData(24);
  await luisXVI.crunch();
  Telegram.getInstance().stopPolling();
})();
