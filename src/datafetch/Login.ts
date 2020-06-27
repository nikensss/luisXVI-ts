import { Page } from 'puppeteer';

/**
 * Performs the login operation on the given page. Tries 30 times before
 * rejecting the login promise.
 */
class Login {
  private _page: Page;

  private static readonly USERNAME_INPUT_SELECTOR: string =
    'input[name="session[username_or_email]"]';
  private static readonly PASSWORD_INPUT_SELECTOR: string =
    'input[name="session[password]"]';
  private static readonly LOGIN_BUTTON_SELECTOR: string =
    'div[data-testid="LoginForm_Login_Button"]';

  constructor(page: Page) {
    this._page = page;
  }

  public async login(username: string, password: string): Promise<void> {
    let tries = 0;
    while (tries < 30) {
      try {
        await this.inputUsername(username);
        await this.inputPassword(password);
        await this.clickLogin();
        return Promise.resolve();
      } catch (ex) {
        tries += 1;
        this.logError('exception while trying to login', ex);
        if (tries % 5 === 0) this._page.reload();
        this.log('trying again');
      }
    }
    return Promise.reject('Cannot log in!');
  }

  //Private implementations

  private log(msg: string) {
    console.log(`[Login] ${msg}`);
  }

  private logError(msg: string, ex: Error) {
    this.log(msg);
    this.log(ex.message);
  }

  private async inputField(selector: string, value: string): Promise<void> {
    await this._page.waitForSelector(selector);
    await this._page.click(selector);
    await this._page.keyboard.type(value);
  }

  private async inputUsername(username: string): Promise<void> {
    this.log('waiting for username input');
    await this.inputField(Login.USERNAME_INPUT_SELECTOR, username);
  }

  private async inputPassword(password: string): Promise<void> {
    this.log('waiting for password input');
    await this.inputField(Login.PASSWORD_INPUT_SELECTOR, password);
  }

  private async clickLogin(): Promise<void> {
    this.log('waiting for login button');
    await this._page.waitForSelector(Login.LOGIN_BUTTON_SELECTOR);
    this.log('clicking login button');
    await this._page.click(Login.LOGIN_BUTTON_SELECTOR);
  }
}

export default Login;
