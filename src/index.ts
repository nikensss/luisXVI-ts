import LuisXVI from './LuisXVI';
import dotenv from 'dotenv';
import Telegram from './utils/Telegram';

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

const luisXVI = new LuisXVI();
luisXVI.fetchData(4);
luisXVI.crunch();

Telegram.getInstance().stopPolling();
