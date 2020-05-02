import { default as Bot } from 'node-telegram-bot-api';
import { promises as fs } from 'fs';
import path from 'path';

class Telegram {
  private static instance: Telegram;
  private bot: Bot;
  private token: string;

  private constructor() {
    if (typeof process.env.telegram_token !== 'string') {
      console.log(typeof process.env.telegram_token);
      throw new Error('[Telegram] Invalid telergam token! ' + process.env.telegram_token);
    }
    this.token = process.env.telegram_token;
    process.env.NTBA_FIX_319 = '1';
    //fixes telegram warning abobut 'Automatic enabling of cancellation of promises is deprecated.'

    this.bot = new Bot(this.token, { polling: true });
    console.log('[Telegram] LuisXVIBot up an running');

    this.bot.on('text', async (msg) => {
      const chatId = msg.chat.id;

      if (msg.text?.startsWith('/id')) {
        this.bot.sendMessage(chatId, `ID is ${chatId}`);
        return;
      }
      if (msg.text?.startsWith('/downloads')) {
        const files = await fs.readdir(path.join(__dirname, '..', 'downloads'));
        this.bot.sendMessage(chatId, `Downloaded files:\n${files.join('\n')}`);
      }
    });

    this.bot.sendMessage(-424947557, 'I am listening.');
  }

  public static getInstance(): Telegram {
    if (!Telegram.instance) {
      Telegram.instance = new Telegram();
    }

    return Telegram.instance;
  }

  public sendMessage(chatId: number, msg: string): void {
    this.bot.sendMessage(chatId, msg);
  }
}

export default Telegram;
