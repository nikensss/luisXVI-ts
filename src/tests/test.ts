import LuisXVI from '../LuisXVI';
import Telegram from '../utils/Telegram';
import dotenv from 'dotenv';

const result = dotenv.config();

(async () => {
  const luisXVI: LuisXVI = new LuisXVI();
  // await luisXVI.execute(24);
  await luisXVI.crunch();
})();

// Telegram.getInstance();
