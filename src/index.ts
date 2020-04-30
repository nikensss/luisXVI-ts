import LuisXVI from './LuisXVI';
import dotenv from 'dotenv';

const result = dotenv.config();

const luisXVI = new LuisXVI();
luisXVI.execute(4);
