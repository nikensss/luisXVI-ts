import LuisXVI from '../LuisXVI';
import Telegram from '../utils/Telegram';
import dotenv from 'dotenv';

const result = dotenv.config();
process.env.NTBA_FIX = '1';

(async () => {
  const luisXVI: LuisXVI = new LuisXVI();
  await luisXVI.fetchData(24);
  await luisXVI.crunch();
  Telegram.getInstance().stopPolling();
})();

// Telegram.getInstance();
