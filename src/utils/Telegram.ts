import { default as Bot } from 'node-telegram-bot-api';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const result = dotenv.config();
if (result.error) throw result.error;

process.env.NTBA_FIX = '1';

class Telegram {
  private static instance: Telegram;
  private bot: Bot;
  private token: string;
  private defaultChatId: string;

  private constructor() {
    if (typeof process.env.telegramToken !== 'string') {
      console.log(typeof process.env.telegramToken);
      throw new Error('[Telegram] Invalid telergam token! ' + process.env.telegramToken);
    }
    this.token = process.env.telegramToken;
    //fixes telegram warning abobut 'Automatic enabling of cancellation of promises is deprecated.'
    process.env.NTBA_FIX_319 = '1';

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

    if (process.env.defaultChatId) {
      this.defaultChatId = process.env.defaultChatId;
      this.notifyWake();
    } else {
      this.defaultChatId = '';
      console.error("[Telegram] No default chat id is present in .env, can't notify start up.");
    }
  }

  public static getInstance(): Telegram {
    if (!Telegram.instance) {
      Telegram.instance = new Telegram();
    }

    return Telegram.instance;
  }

  public sendMessage(chatId: string | number, msg: string, options?: {}): void {
    this.bot.sendMessage(chatId, msg, options);
  }

  public sendDocument(path: string): void {
    this.bot.sendDocument(this.defaultChatId, path);
  }

  public sendDefault(msg: string, options?: {}): void {
    if (this.defaultChatId === '') {
      console.warn(`[Telegram] Can't send to default chat because there is no default chat id defined`);
    }
    this.sendMessage(this.defaultChatId, msg, options);
  }

  public sendQuiet(msg: string, options?: {}): void {
    if (!options) options = {};
    Object.assign(options, { disable_notification: true });
    this.sendDefault(msg, options);
  }

  public stopPolling(): void {
    this.bot.stopPolling();
  }

  // Private implementations
  private notifyWake(): void {
    this.sendQuiet('I am listening.');
  }
}

export default Telegram;
