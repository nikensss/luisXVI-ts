import LuisXVI from '../LuisXVI';
import Telegram from '../utils/Telegram';
import dotenv from 'dotenv';

const result = dotenv.config();

const luisXVI: LuisXVI = new LuisXVI();
// luisXVI.execute(4).then(() => luisXVI.crunch());
luisXVI.crunch();

// Telegram.getInstance();
