import axios from 'axios';

class Telegram {
  private static instance: Telegram;
  private token: string;
  private url: string = 'http://api.telegram.org/bot';

  private constructor() {
    if (typeof process.env.telegram_token !== 'string') {
      console.log(typeof process.env.telegram_token);
      throw new Error('[Telegram] Invalid telergam token! ' + process.env.telegram_token);
    }
    this.token = process.env.telegram_token;
  }

  public static getInstance(): Telegram {
    if (!Telegram.instance) {
      Telegram.instance = new Telegram();
    }

    return Telegram.instance;
  }

  public sendMessage(msg: string): void {
    this.api('sendMessage', { name: 'text', value: msg });
  }

  public async getUpdates() {
    console.log('getting updates');
    const result = await axios.get('getUpdates');
    console.log(result);
  }

  private async api(method: string, ...params: [{ name: string; value: string }]) {
    return axios.post(
      this.url + this.token + '/' + method + '?' + params?.map((e) => `${e.name}=${e.value}`).join('&')
    );
  }
}

export default Telegram;
